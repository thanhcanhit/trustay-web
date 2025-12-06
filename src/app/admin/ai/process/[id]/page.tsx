"use client";

import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Loader2, Clock, Zap, Database, CheckCircle2, XCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import {
	ReactFlow,
	Background,
	Controls,
	MiniMap,
	Node,
	Edge,
	Connection,
	useNodesState,
	useEdgesState,
	addEdge,
	ConnectionMode,
	Panel,
	ReactFlowProvider,
	MarkerType,
	Handle,
	Position,
	useReactFlow,
	getNodesBounds,
	getViewportForBounds,
	BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { getAILogById } from '@/actions/admin-ai.action';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { StatusBadge } from '../../_components/badges';
import { formatDateTime, formatDuration } from '../../_components/utils';
import type { AILogEntry } from '@/types/admin-ai';

interface ProcessStep {
	stepNumber: number;
	title: string;
	content: string;
}

function parseStepsLog(stepsLog: string | null | undefined): ProcessStep[] {
	if (!stepsLog) return [];

	const steps: ProcessStep[] = [];
	
	// Hỗ trợ 2 format:
	// 1. Format cũ: ===STEP 1===
	// 2. Format mới: ## Step 1 - TITLE
	const oldFormatRegex = /===STEP (\d+)===\s*([\s\S]*?)(?=\n===STEP|\n*$)/g;
	const newFormatRegex = /## Step (\d+)\s*-\s*([^\n]+)\n([\s\S]*?)(?=\n## Step|\n*$)/g;
	
	// Thử format mới trước (## Step X - TITLE)
	let match = newFormatRegex.exec(stepsLog);
	if (match) {
		// Reset regex để scan lại từ đầu
		newFormatRegex.lastIndex = 0;
		while ((match = newFormatRegex.exec(stepsLog)) !== null) {
			const stepNumber = parseInt(match[1], 10);
			const title = match[2].trim();
			const content = match[3].trim();

			steps.push({
				stepNumber,
				title,
				content: content || title,
			});
		}
	} else {
		// Fallback về format cũ (===STEP X===)
		while ((match = oldFormatRegex.exec(stepsLog)) !== null) {
			const stepNumber = parseInt(match[1], 10);
			const content = match[2].trim();
			const lines = content.split('\n').filter((line) => line.trim());
			const title = lines[0] || `Step ${stepNumber}`;
			const fullContent = lines.slice(1).join('\n').trim() || title;

			steps.push({
				stepNumber,
				title,
				content: fullContent,
			});
		}
	}

	return steps.sort((a, b) => a.stepNumber - b.stepNumber);
}

const nodeTypes = {
	default: ({ data, isConnectable = false }: { data: { label: string; content: string; stepNumber: number }; isConnectable?: boolean }) => {
		const colors = [
			{ bg: 'bg-blue-500', border: 'border-blue-600', text: 'text-blue-700', light: 'bg-blue-50' },
			{ bg: 'bg-green-500', border: 'border-green-600', text: 'text-green-700', light: 'bg-green-50' },
			{ bg: 'bg-purple-500', border: 'border-purple-600', text: 'text-purple-700', light: 'bg-purple-50' },
			{ bg: 'bg-amber-500', border: 'border-amber-600', text: 'text-amber-700', light: 'bg-amber-50' },
			{ bg: 'bg-indigo-500', border: 'border-indigo-600', text: 'text-indigo-700', light: 'bg-indigo-50' },
		];
		const color = colors[(data.stepNumber - 1) % colors.length] || colors[0];

		return (
			<div className={`px-4 py-3 shadow-xl rounded-xl bg-white border-2 ${color.border} min-w-[320px] max-w-[450px] transition-shadow duration-300 hover:shadow-2xl relative`}>
				{/* Source handle - ở dưới node, chỉ để edges kết nối, không cho phép manual connect */}
				<Handle
					type="source"
					position={Position.Bottom}
					id={`source-${data.stepNumber}`}
					style={{ background: '#6366f1', width: 12, height: 12 }}
					isConnectable={false}
				/>
				{/* Target handle - ở trên node, chỉ để edges kết nối, không cho phép manual connect */}
				<Handle
					type="target"
					position={Position.Top}
					id={`target-${data.stepNumber}`}
					style={{ background: '#6366f1', width: 12, height: 12 }}
					isConnectable={false}
				/>
				<div className="flex items-center gap-3 mb-3">
					<div className={`${color.bg} text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold shadow-md`}>
						{data.stepNumber}
					</div>
					<div className={`font-semibold text-sm ${color.text} flex-1 text-left`}>{data.label}</div>
				</div>
				<div className={`text-xs text-gray-600 max-h-[180px] overflow-y-auto ${color.light} rounded-md p-2 border text-left prose prose-sm max-w-none`}>
					<ReactMarkdown
						components={{
							code: ({ className, children, ...props }) => {
								const isInline = !className;
								return isInline ? (
									<code className="bg-gray-200 px-1 py-0.5 rounded text-xs" {...props}>
										{children}
									</code>
								) : (
									<pre className="bg-gray-800 text-gray-100 p-2 rounded text-xs overflow-x-auto">
										<code {...props}>{children}</code>
									</pre>
								);
							},
							p: ({ children }) => <p className="mb-1 last:mb-0">{children}</p>,
							ul: ({ children }) => <ul className="list-disc list-inside mb-1 space-y-0.5">{children}</ul>,
							ol: ({ children }) => <ol className="list-decimal list-inside mb-1 space-y-0.5">{children}</ol>,
							li: ({ children }) => <li className="text-xs">{children}</li>,
							strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
							em: ({ children }) => <em className="italic">{children}</em>,
							h1: ({ children }) => <h1 className="text-sm font-bold mb-1">{children}</h1>,
							h2: ({ children }) => <h2 className="text-xs font-bold mb-1">{children}</h2>,
							h3: ({ children }) => <h3 className="text-xs font-semibold mb-0.5">{children}</h3>,
							blockquote: ({ children }) => (
								<blockquote className="border-l-2 border-gray-300 pl-2 my-1 italic">{children}</blockquote>
							),
							table: ({ children }) => (
								<div className="overflow-x-auto my-1">
									<table className="min-w-full text-xs border-collapse border border-gray-300">
										{children}
									</table>
								</div>
							),
							thead: ({ children }) => <thead className="bg-gray-100">{children}</thead>,
							tbody: ({ children }) => <tbody>{children}</tbody>,
							tr: ({ children }) => <tr className="border-b border-gray-200">{children}</tr>,
							th: ({ children }) => (
								<th className="border border-gray-300 px-2 py-1 text-left font-semibold">{children}</th>
							),
							td: ({ children }) => <td className="border border-gray-300 px-2 py-1">{children}</td>,
						}}
					>
						{data.content}
					</ReactMarkdown>
				</div>
			</div>
		);
	},
};

// Inner component để access ReactFlow instance
function FlowContent({
	nodes,
	edges,
	onNodesChange,
	onEdgesChange,
	onConnect,
	nodeTypes,
}: {
	nodes: Node[];
	edges: Edge[];
	onNodesChange: (changes: any) => void;
	onEdgesChange: (changes: any) => void;
	onConnect: (params: Connection) => void;
	nodeTypes: any;
}) {
	const { fitView } = useReactFlow();
	
	// Filter out self-loops - đảm bảo không có self-loops
	const filteredEdges = useMemo(() => {
		return edges.filter((edge) => {
			// Loại bỏ self-loops
			if (edge.source === edge.target) {
				return false;
			}
			// Đảm bảo sourceHandle và targetHandle không trùng nhau
			if (edge.sourceHandle && edge.targetHandle && edge.sourceHandle === edge.targetHandle) {
				return false;
			}
			return true;
		});
	}, [edges]);

	// Auto fit view sau khi nodes được render
	useEffect(() => {
		if (nodes.length > 0 && filteredEdges.length > 0) {
			setTimeout(() => {
				fitView({ padding: 0.3, maxZoom: 1.2, duration: 300 });
			}, 100);
		}
	}, [nodes, filteredEdges, fitView]);

	return (
		<ReactFlow
			nodes={nodes}
			edges={filteredEdges}
			onNodesChange={onNodesChange}
			onEdgesChange={(changes) => {
				// Filter out self-loops và chỉ cho phép changes từ controls
				const validChanges = changes.filter((change) => {
					if (change.type === 'remove' && change.id) {
						const edge = filteredEdges.find((e) => e.id === change.id);
						return edge && edge.source !== edge.target;
					}
					return true;
				});
				onEdgesChange(validChanges);
			}}
			onConnect={onConnect}
			connectionMode={ConnectionMode.Loose}
			nodeTypes={nodeTypes}
			fitView
			fitViewOptions={{ padding: 0.3, maxZoom: 1.2 }}
			defaultEdgeOptions={{
				animated: true,
				style: { strokeWidth: 3, stroke: '#6366f1' },
				markerEnd: {
					type: MarkerType.ArrowClosed,
					color: '#6366f1',
					width: 20,
					height: 20,
				},
			}}
			// Chỉ cho phép select, không cho phép tạo connections mới
			nodesConnectable={false}
			// Enable drag drop
			selectNodesOnDrag={true}
			nodesDraggable={true}
		>
			<Background variant={BackgroundVariant.Dots} gap={16} size={1} color="#e5e7eb" />
			<Controls />
			<MiniMap
				nodeColor={(node) => {
					const stepNum = (node.data as { stepNumber?: number })?.stepNumber || 1;
					const colors = ['#3b82f6', '#10b981', '#a855f7', '#f59e0b', '#6366f1'];
					return colors[(stepNum - 1) % colors.length] || '#6b7280';
				}}
				style={{ backgroundColor: '#f9fafb' }}
			/>
		</ReactFlow>
	);
}

export default function ProcessDetailPage() {
	const params = useParams();
	const router = useRouter();
	const logId = params.id as string;

	const { data: logsData, isLoading, error } = useQuery({
		queryKey: ['admin-ai-log', logId],
		queryFn: () => getAILogById(logId),
		enabled: !!logId,
	});

	const steps = useMemo(() => {
		if (!logsData?.stepsLog) return [];
		return parseStepsLog(logsData.stepsLog);
	}, [logsData?.stepsLog]);

	const initialNodes: Node[] = useMemo(() => {
		if (steps.length === 0) return [];

		// Auto layout - đối xứng trái phải, trên xuống (zigzag pattern)
		const nodeWidth = 450; // max-w-[450px]
		const nodeHeight = 250; // estimated height
		const verticalSpacing = 280; // spacing giữa các nodes theo chiều dọc
		const horizontalSpacing = 300; // spacing ngang để tạo đối xứng
		
		// Center X của canvas
		const centerX = 500;
		// Offset trái phải
		const leftOffset = -horizontalSpacing / 2;
		const rightOffset = horizontalSpacing / 2;

		return steps.map((step, index) => {
			// Zigzag pattern: step chẵn bên trái, step lẻ bên phải (hoặc ngược lại)
			// Step 1 ở giữa, step 2 bên trái, step 3 bên phải, step 4 bên trái, ...
			const isEven = index % 2 === 0;
			const x = index === 0 
				? centerX // Step đầu tiên ở giữa
				: isEven 
					? centerX + rightOffset // Step chẵn bên phải
					: centerX + leftOffset; // Step lẻ bên trái
			
			const y = index * verticalSpacing + 100;

			return {
				id: `step-${step.stepNumber}`,
				type: 'default',
				position: { x, y },
				data: {
					label: step.title,
					content: step.content,
					stepNumber: step.stepNumber,
				},
			};
		});
	}, [steps]);

	const initialEdges: Edge[] = useMemo(() => {
		if (steps.length <= 1) return [];

		// Tạo edges tuần tự: step 1 -> step 2 -> step 3 -> ...
		const edges: Edge[] = [];
		for (let i = 0; i < steps.length - 1; i++) {
			const currentStep = steps[i];
			const nextStep = steps[i + 1];
			
			// Đảm bảo không tạo self-loop
			if (currentStep.stepNumber === nextStep.stepNumber) {
				continue;
			}
			
			edges.push({
				id: `edge-${currentStep.stepNumber}-${nextStep.stepNumber}`,
				source: `step-${currentStep.stepNumber}`,
				sourceHandle: `source-${currentStep.stepNumber}`,
				target: `step-${nextStep.stepNumber}`,
				targetHandle: `target-${nextStep.stepNumber}`,
				type: 'smoothstep',
				animated: true,
				style: {
					strokeWidth: 3,
					stroke: '#6366f1',
				},
				markerEnd: {
					type: MarkerType.ArrowClosed,
					color: '#6366f1',
					width: 20,
					height: 20,
				},
			});
		}
		
		return edges;
	}, [steps]);

	const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
	const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

	useEffect(() => {
		if (initialNodes.length > 0) {
			setNodes(initialNodes);
		}
		if (initialEdges.length > 0) {
			// Filter out any self-loops trước khi set edges - đảm bảo không có self-loops
			const filteredEdges = initialEdges.filter((edge) => {
				// Loại bỏ self-loops và đảm bảo source != target
				if (edge.source === edge.target) {
					return false;
				}
				// Đảm bảo sourceHandle và targetHandle không trùng nhau
				if (edge.sourceHandle && edge.targetHandle && edge.sourceHandle === edge.targetHandle) {
					return false;
				}
				return true;
			});
			setEdges(filteredEdges);
		}
	}, [initialNodes, initialEdges, setNodes, setEdges]);

	// Disable manual connections và reject self-loops
	const onConnect = (params: Connection) => {
		// Reject self-loops và tất cả connections thủ công
		if (params.source === params.target) {
			return;
		}
		// Không cho phép tạo connections thủ công
		return;
	};

	if (isLoading) {
		return (
			<div className="flex items-center justify-center h-screen">
				<Loader2 className="size-8 animate-spin text-muted-foreground" />
			</div>
		);
	}

	if (error || !logsData) {
		return (
			<div className="flex flex-col items-center justify-center h-screen gap-4">
				<p className="text-lg text-red-600">Không tìm thấy process log</p>
				<Button onClick={() => router.push('/admin/ai')}>Quay lại</Button>
			</div>
		);
	}

	return (
		<div className="h-screen flex flex-col">
			<div className="border-b bg-white px-4 py-3 flex items-center gap-4">
				<Button variant="ghost" size="icon" onClick={() => router.push('/admin/ai')}>
					<ArrowLeft className="size-4" />
				</Button>
				<div className="flex-1">
					<h1 className="text-lg font-semibold">Process Flow</h1>
					<p className="text-sm text-muted-foreground">ID: {logId.substring(0, 8)}...</p>
				</div>
			</div>

			<div className="flex-1 flex overflow-hidden">
				{/* React Flow - Main Area */}
			<div className="flex-1 relative">
					{steps.length > 0 ? (
						<>
							<style jsx global>{`
								@keyframes flow {
									0% {
										stroke-dashoffset: 0;
									}
									100% {
										stroke-dashoffset: -24;
									}
								}
								.react-flow__edge-path {
									stroke-dasharray: 8 4;
									animation: flow 1.2s linear infinite;
								}
							`}</style>
							<ReactFlowProvider>
								<FlowContent
									nodes={nodes}
									edges={edges}
									onNodesChange={onNodesChange}
									onEdgesChange={onEdgesChange}
									onConnect={onConnect}
									nodeTypes={nodeTypes}
								/>
							</ReactFlowProvider>
					</>
					) : (
						<div className="flex items-center justify-center h-full">
							<div className="text-center">
								<p className="text-lg text-muted-foreground mb-2">Không có steps log</p>
								<p className="text-sm text-muted-foreground">Process này không có thông tin steps</p>
							</div>
						</div>
					)}
				</div>

				{/* Info Panel - Right Sidebar */}
				<div className="w-80 border-l bg-white overflow-y-auto">
					<div className="p-4 space-y-4">
						<div>
							<h2 className="text-sm font-semibold mb-2">Question</h2>
							<p className="text-sm text-muted-foreground bg-slate-50 p-2 rounded border">{logsData.question}</p>
						</div>

						{logsData.response && (
							<div>
								<h2 className="text-sm font-semibold mb-2">Response</h2>
								<p className="text-sm text-muted-foreground bg-green-50 p-2 rounded border">{logsData.response}</p>
							</div>
						)}

						<div>
							<h2 className="text-sm font-semibold mb-2">Status</h2>
							<StatusBadge status={logsData.status} />
						</div>

						<div>
							<h2 className="text-sm font-semibold mb-2">Timing</h2>
							<Table>
								<TableBody>
									<TableRow>
										<TableCell className="text-xs">Total Duration</TableCell>
										<TableCell className="text-xs font-medium">{formatDuration(logsData.totalDuration)}</TableCell>
									</TableRow>
									<TableRow>
										<TableCell className="text-xs">Created At</TableCell>
										<TableCell className="text-xs font-medium">{formatDateTime(logsData.createdAt)}</TableCell>
									</TableRow>
								</TableBody>
							</Table>
						</div>

						{logsData.orchestratorData && (
							<div>
								<h2 className="text-sm font-semibold mb-2 flex items-center gap-2">
									<Zap className="size-4 text-blue-600" />
									Orchestrator
								</h2>
								<Table>
									<TableBody>
										{(() => {
											const data = logsData.orchestratorData as Record<string, unknown>;
											const duration = data.duration ? String(data.duration) : null;
											const userRole = data.userRole ? String(data.userRole) : null;
											const entityHint = data.entityHint ? String(data.entityHint) : null;
											const tablesHint = data.tablesHint ? String(data.tablesHint) : null;
											return (
												<>
													{duration && (
														<TableRow>
															<TableCell className="text-xs">Duration</TableCell>
															<TableCell className="text-xs font-medium">{duration}ms</TableCell>
														</TableRow>
													)}
													{userRole && (
														<TableRow>
															<TableCell className="text-xs">User Role</TableCell>
															<TableCell className="text-xs font-medium">{userRole}</TableCell>
														</TableRow>
													)}
													{entityHint && (
														<TableRow>
															<TableCell className="text-xs">Entity</TableCell>
															<TableCell className="text-xs font-medium">{entityHint}</TableCell>
														</TableRow>
													)}
													{tablesHint && (
														<TableRow>
															<TableCell className="text-xs">Tables</TableCell>
															<TableCell className="text-xs font-medium break-words">{tablesHint}</TableCell>
														</TableRow>
													)}
												</>
											);
										})()}
									</TableBody>
								</Table>
							</div>
						)}

						{logsData.sqlGenerationAttempts && logsData.sqlGenerationAttempts.length > 0 && (
							<div>
								<h2 className="text-sm font-semibold mb-2 flex items-center gap-2">
									<Database className="size-4 text-purple-600" />
									SQL Generation ({logsData.sqlGenerationAttempts.length})
								</h2>
								<div className="space-y-2">
									{logsData.sqlGenerationAttempts.map((attempt, idx) => {
										const attemptData = attempt as Record<string, unknown>;
										const finalSql = attemptData.finalSql ? String(attemptData.finalSql) : null;
										const durationMs = attemptData.durationMs ? String(attemptData.durationMs) : null;
										return (
											<div key={idx} className="bg-purple-50 border border-purple-200 rounded p-2">
												<div className="text-xs font-medium mb-1">Attempt #{idx + 1}</div>
												{finalSql && (
													<pre className="text-xs font-mono bg-white border rounded p-1 overflow-x-auto whitespace-pre-wrap max-h-[100px] overflow-y-auto">
														{finalSql}
													</pre>
												)}
												{durationMs && (
													<div className="text-xs text-muted-foreground mt-1">
														Duration: {durationMs}ms
													</div>
												)}
											</div>
										);
									})}
								</div>
							</div>
						)}

						{logsData.validatorData && (
							<div>
								<h2 className="text-sm font-semibold mb-2 flex items-center gap-2">
									{((logsData.validatorData as Record<string, unknown>).isValid ? (
										<CheckCircle2 className="size-4 text-green-600" />
									) : (
										<XCircle className="size-4 text-red-600" />
									))}
									Validator
								</h2>
								<Table>
									<TableBody>
										{(() => {
											const data = logsData.validatorData as Record<string, unknown>;
											const isValid = data.isValid !== undefined ? String(data.isValid) === 'true' : null;
											const duration = data.duration ? String(data.duration) : null;
											return (
												<>
													{isValid !== null && (
														<TableRow>
															<TableCell className="text-xs">Valid</TableCell>
															<TableCell className="text-xs font-medium">
																{isValid ? (
																	<Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
																		Valid
																	</Badge>
																) : (
																	<Badge variant="outline" className="bg-red-50 text-red-700 border-red-300">
																		Invalid
																	</Badge>
																)}
															</TableCell>
														</TableRow>
													)}
													{duration && (
														<TableRow>
															<TableCell className="text-xs">Duration</TableCell>
															<TableCell className="text-xs font-medium">{duration}ms</TableCell>
														</TableRow>
													)}
												</>
											);
										})()}
									</TableBody>
								</Table>
							</div>
						)}

						{logsData.tokenUsage && (
							<div>
								<h2 className="text-sm font-semibold mb-2 flex items-center gap-2">
									<Clock className="size-4 text-amber-600" />
									Token Usage
								</h2>
								<Table>
									<TableBody>
										<TableRow>
											<TableCell className="text-xs">Total</TableCell>
											<TableCell className="text-xs font-medium">
												{String((logsData.tokenUsage as { totalTokens?: number })?.totalTokens || 'N/A')}
											</TableCell>
										</TableRow>
										{(logsData.tokenUsage as { promptTokens?: number })?.promptTokens !== undefined && (
											<TableRow>
												<TableCell className="text-xs">Prompt</TableCell>
												<TableCell className="text-xs font-medium">
													{String((logsData.tokenUsage as { promptTokens?: number }).promptTokens)}
												</TableCell>
											</TableRow>
										)}
										{(logsData.tokenUsage as { completionTokens?: number })?.completionTokens !== undefined && (
											<TableRow>
												<TableCell className="text-xs">Completion</TableCell>
												<TableCell className="text-xs font-medium">
													{String((logsData.tokenUsage as { completionTokens?: number }).completionTokens)}
												</TableCell>
											</TableRow>
										)}
									</TableBody>
								</Table>
							</div>
						)}

						{logsData.error && (
							<div>
								<h2 className="text-sm font-semibold mb-2 text-red-600">Error</h2>
								<p className="text-xs text-red-600 bg-red-50 p-2 rounded border border-red-200 whitespace-pre-wrap">
									{logsData.error}
								</p>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}

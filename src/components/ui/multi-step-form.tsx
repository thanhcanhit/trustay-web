"use client"

import React, { useState, createContext, useContext } from 'react'
import { cn } from '@/lib/utils'
import { Button } from './button'
import { Check, ChevronLeft, ChevronRight } from 'lucide-react'

interface Step {
  id: string
  title: string
  description?: string
  isValid?: boolean
  isOptional?: boolean
}

interface MultiStepFormContextType {
  currentStep: number
  steps: Step[]
  goToStep: (step: number) => void
  nextStep: () => void
  prevStep: () => void
  isFirstStep: boolean
  isLastStep: boolean
  canGoNext: boolean
  canGoPrev: boolean
}

const MultiStepFormContext = createContext<MultiStepFormContextType | null>(null)

export function useMultiStepForm() {
  const context = useContext(MultiStepFormContext)
  if (!context) {
    throw new Error('useMultiStepForm must be used within a MultiStepForm')
  }
  return context
}

interface MultiStepFormProps {
  children: React.ReactNode
  steps: Step[]
  currentStep?: number
  onStepChange?: (step: number) => void
  className?: string
}

export function MultiStepForm({
  children,
  steps,
  currentStep: controlledStep,
  onStepChange,
  className
}: MultiStepFormProps) {
  const [internalStep, setInternalStep] = useState(0)
  
  const currentStep = controlledStep ?? internalStep
  const isControlled = controlledStep !== undefined

  const goToStep = (step: number) => {
    if (step >= 0 && step < steps.length) {
      if (isControlled) {
        onStepChange?.(step)
      } else {
        setInternalStep(step)
      }
    }
  }

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      goToStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      goToStep(currentStep - 1)
    }
  }

  const isFirstStep = currentStep === 0
  const isLastStep = currentStep === steps.length - 1
  const canGoNext = !isLastStep && (steps[currentStep]?.isValid !== false)
  const canGoPrev = !isFirstStep

  const contextValue: MultiStepFormContextType = {
    currentStep,
    steps,
    goToStep,
    nextStep,
    prevStep,
    isFirstStep,
    isLastStep,
    canGoNext,
    canGoPrev
  }

  return (
    <MultiStepFormContext.Provider value={contextValue}>
      <div className={cn("space-y-8", className)}>
        {/* Step Indicator */}
        <div className="relative flex items-center justify-center mb-4">
          {/* Connector Line Background */}
          <div className="absolute top-5 left-1/2 transform -translate-x-1/2 w-full max-w-md h-0.5 bg-muted" />

          <div className="flex items-center justify-between w-full max-w-md relative">
            {steps.map((step, index) => (
              <div key={step.id} className="flex flex-col items-center">
                {/* Step Circle */}
                <div
                  className={cn(
                    "flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors mb-2 bg-background",
                    index < currentStep && "bg-primary border-primary text-primary-foreground",
                    index === currentStep && "border-primary text-primary",
                    index > currentStep && "border-muted-foreground text-muted-foreground"
                  )}
                >
                  {index < currentStep ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <span className="text-sm font-medium">{index + 1}</span>
                  )}
                </div>

                {/* Progress Line */}
                {index < currentStep && index < steps.length - 1 && (
                  <div className="absolute top-5 h-0.5 bg-primary"
                       style={{
                         left: `${(index / (steps.length - 1)) * 100}%`,
                         width: `${(1 / (steps.length - 1)) * 100}%`
                       }} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Current Step Info */}
        <div className="text-center mb-6">
          <h2 className="text-xl font-semibold text-foreground mb-1">
            {steps[currentStep]?.title}
          </h2>
          {steps[currentStep]?.description && (
            <p className="text-sm text-muted-foreground">
              {steps[currentStep].description}
            </p>
          )}
        </div>

        {/* Form Content */}
        <div className="min-h-[300px]">
          {children}
        </div>
      </div>
    </MultiStepFormContext.Provider>
  )
}

interface StepContentProps {
  step?: number
  stepIndex?: number
  currentStep?: number
  children: React.ReactNode
}

export function StepContent({ step, stepIndex, currentStep: propCurrentStep, children }: StepContentProps) {
  const { currentStep } = useMultiStepForm()
  
  // Use prop currentStep if provided, otherwise use context currentStep
  const activeStep = propCurrentStep ?? currentStep
  const targetStep = stepIndex ?? step ?? 0
  
  if (activeStep !== targetStep) {
    return null
  }

  return <div>{children}</div>
}

interface StepNavigationProps {
  onNext?: () => void | Promise<void>
  onPrev?: () => void
  onSubmit?: () => void | Promise<void>
  nextLabel?: string
  prevLabel?: string
  submitLabel?: string
  isLastStep?: boolean
  canProceed?: boolean
  isLoading?: boolean
  className?: string
}

export function StepNavigation({
  onNext,
  onPrev,
  onSubmit,
  nextLabel = "Tiếp theo",
  prevLabel = "Quay lại", 
  submitLabel = "Hoàn thành",
  isLastStep: propIsLastStep,
  canProceed: propCanProceed,
  isLoading = false,
  className
}: StepNavigationProps) {
  const { 
    nextStep, 
    prevStep, 
    canGoNext, 
    canGoPrev, 
    isFirstStep, 
    isLastStep 
  } = useMultiStepForm()
  
  // Use props if provided, otherwise use context
  const activeIsLastStep = propIsLastStep ?? isLastStep
  const activeCanProceed = propCanProceed ?? canGoNext

  const handleNext = async () => {
    if (onNext) {
      await onNext()
    }
    nextStep()
  }

  const handlePrev = () => {
    if (onPrev) {
      onPrev()
    }
    prevStep()
  }

  const handleSubmit = () => {
    if (onSubmit) {
      onSubmit()
    }
  }

  return (
    <div className={cn("flex justify-between pt-6", className)}>
      <Button
        type="button"
        variant="outline"
        onClick={handlePrev}
        disabled={!canGoPrev || isLoading}
        className={`${isFirstStep ? "invisible" : ""} cursor-pointer`}
      >
        <ChevronLeft className="w-4 h-4 mr-2" />
        {prevLabel}
      </Button>

      {activeIsLastStep ? (
        <Button
          type="button"
          onClick={handleSubmit}
          disabled={isLoading}
          className="cursor-pointer"
        >
          {isLoading ? "Đang xử lý..." : submitLabel}
        </Button>
      ) : (
        <Button
          type="button"
          onClick={handleNext}
          disabled={!activeCanProceed || isLoading}
          className="cursor-pointer"
        >
          {nextLabel}
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      )}
    </div>
  )
}

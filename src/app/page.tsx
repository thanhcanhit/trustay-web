export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] text-center">
        <div className="max-w-3xl mx-auto space-y-8">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground">
            Chào mừng đến với{" "}
            <span className="text-primary">Trustay</span>
          </h1>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Nền tảng đáng tin cậy cho mọi nhu cầu của bạn.
            Trải nghiệm dịch vụ chất lượng cao với sự an toàn và bảo mật tuyệt đối.
          </p>

          <div className="flex gap-4 items-center justify-center flex-col sm:flex-row">
            <a
              href="/services"
              className="rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 font-medium px-6 py-3 transition-colors"
            >
              Khám phá dịch vụ
            </a>
            <a
              href="/about"
              className="rounded-lg border border-border hover:bg-accent hover:text-accent-foreground font-medium px-6 py-3 transition-colors"
            >
              Tìm hiểu thêm
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

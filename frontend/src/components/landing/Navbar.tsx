import { Button, Container } from "../ui";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-slate-950/80 backdrop-blur-xl">
      <Container className="flex h-20 items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 font-bold text-slate-950">
            A
          </div>

          <div>
            <p className="text-lg font-semibold text-white">AzaLens</p>
            <p className="text-xs text-slate-500">
              AI Stock Intelligence
            </p>
          </div>
        </div>

        <nav className="hidden items-center gap-8 text-sm text-slate-400 md:flex">
          <a className="transition hover:text-white" href="#features">
            Features
          </a>

          <a className="transition hover:text-white" href="#pricing">
            Pricing
          </a>

          <a className="transition hover:text-white" href="#product">
            Product
          </a>

          <a className="transition hover:text-white" href="#about">
            About
          </a>
        </nav>

        <Button size="sm">Start Free</Button>
      </Container>
    </header>
  );
}

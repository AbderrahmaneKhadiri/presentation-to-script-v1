import Link from "next/link";
import { Presentation, Github, Twitter, Linkedin } from "lucide-react";

export function Footer() {
  return (
    // CHANGEMENT ICI : bg-neutral-950 au lieu de bg-black
    <footer className="relative pt-20 pb-10 bg-neutral-950 border-t border-white/10 overflow-hidden">

      {/* --- Effet de lumière discret en fond --- */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-emerald-500/5 blur-[100px] rounded-full" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">

          {/* Colonne Marque */}
          <div className="md:col-span-5 space-y-6">
            <Link href="/" className="flex items-center gap-2 group w-fit">
              <div className="p-2 rounded-xl bg-white/5 border border-white/10 group-hover:border-emerald-500/50 transition-colors">
                <Presentation className="h-6 w-6 text-emerald-400" />
              </div>
              <span className="font-bold text-xl text-white tracking-tight">Presenter's CoPilot</span>
            </Link>
            <p className="text-neutral-400 text-sm leading-relaxed max-w-md">
              Transformez vos présentations en discours captivants grâce à l'intelligence artificielle.
              Gagnez du temps et captivez votre audience.
            </p>

            {/* Réseaux sociaux */}
            <div className="flex items-center gap-4">
              <SocialLink href="#" icon={<Twitter className="w-4 h-4" />} label="Twitter" />
              <SocialLink href="#" icon={<Github className="w-4 h-4" />} label="GitHub" />
              <SocialLink href="#" icon={<Linkedin className="w-4 h-4" />} label="LinkedIn" />
            </div>
          </div>

          {/* Colonnes de Liens */}
          <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8">
            <div className="space-y-4">
              <h4 className="font-semibold text-white tracking-wide">Produit</h4>
              <ul className="space-y-2 text-sm text-neutral-400">
                <li><FooterLink href="/generate">Générateur</FooterLink></li>
                <li><FooterLink href="#">Tarifs</FooterLink></li>
                <li><FooterLink href="#">Exemples</FooterLink></li>
                <li><FooterLink href="#">Guide</FooterLink></li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold text-white tracking-wide">Entreprise</h4>
              <ul className="space-y-2 text-sm text-neutral-400">
                <li><FooterLink href="#">À propos</FooterLink></li>
                <li><FooterLink href="#">Blog</FooterLink></li>
                <li><FooterLink href="#">Carrières</FooterLink></li>
                <li><FooterLink href="#">Contact</FooterLink></li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold text-white tracking-wide">Légal</h4>
              <ul className="space-y-2 text-sm text-neutral-400">
                <li><FooterLink href="#">Confidentialité</FooterLink></li>
                <li><FooterLink href="#">CGU</FooterLink></li>
                <li><FooterLink href="#">Mentions légales</FooterLink></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Barre du bas */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
          <p>&copy; {new Date().getFullYear()} Presenter's CoPilot. Tous droits réservés.</p>
          <div className="flex items-center gap-8">
            <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function SocialLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link
      href={href}
      aria-label={label}
      className="p-2 rounded-full bg-white/5 border border-white/10 text-neutral-400 hover:bg-emerald-500/10 hover:text-emerald-400 hover:border-emerald-500/50 transition-all duration-300"
    >
      {icon}
    </Link>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="block hover:text-emerald-400 hover:translate-x-1 transition-all duration-200"
    >
      {children}
    </Link>
  );
}
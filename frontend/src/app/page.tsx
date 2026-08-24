import Link from "next/link";
import { 
  Search, 
  Globe, 
  MapPin, 
  Activity, 
  ShieldCheck, 
  Lock,
  ArrowRight,
  AlertTriangle
} from "lucide-react";

const tools = [
  {
    name: "Port Scanner",
    description: "Scan open ports on any target using Nmap-like functionality",
    icon: Search,
    href: "/tools/port-scan",
    color: "bg-blue-500"
  },
  {
    name: "DNS Lookup",
    description: "Query DNS records including A, MX, NS, TXT records",
    icon: Globe,
    href: "/tools/dns-lookup",
    color: "bg-green-500"
  },
  {
    name: "WHOIS Query",
    description: "Get domain and IP registration information",
    icon: Lock,
    href: "/tools/whois",
    color: "bg-purple-500"
  },
  {
    name: "Ping Test",
    description: "Test network connectivity and measure response times",
    icon: Activity,
    href: "/tools/ping",
    color: "bg-red-500"
  },
  {
    name: "GeoIP Lookup",
    description: "Get geographical location and ISP information for IPs",
    icon: MapPin,
    href: "/tools/geo-ip",
    color: "bg-yellow-500"
  },
  {
    name: "SSL Checker",
    description: "Verify SSL certificates and check validity",
    icon: ShieldCheck,
    href: "/tools/ssl-check",
    color: "bg-indigo-500"
  },
  {
    name: "Security Analysis",
    description: "Advanced threat intelligence using multiple security APIs",
    icon: AlertTriangle,
    href: "/security-analysis",
    color: "bg-red-600"
  }
];

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-gray-50 to-white py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Professional <span className="text-primary">Cyber Security</span> Tools
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Powerful web-based security tools for network analysis, reconnaissance, and vulnerability assessment.
          </p>
          <div className="flex justify-center space-x-4">
            <Link href="/tools/port-scan" className="btn-primary inline-flex items-center space-x-2">
              <span>Get Started</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link href="/register" className="btn-secondary inline-flex items-center space-x-2">
              <span>Create Account</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Ad Space */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg h-24 flex items-center justify-center">
          <p className="text-gray-500">Google Ads - 728x90</p>
        </div>
      </div>

      {/* Tools Grid */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Available Tools
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tools.map((tool) => {
              const Icon = tool.icon;
              return (
                <Link
                  key={tool.name}
                  href={tool.href}
                  className="card group hover:border-primary transition-all duration-200"
                >
                  <div className="flex items-start space-x-4">
                    <div className={`${tool.color} p-3 rounded-lg text-white`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-primary transition-colors">
                        {tool.name}
                      </h3>
                      <p className="text-gray-600">
                        {tool.description}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-primary font-medium">
                    <span>Use Tool</span>
                    <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Why Choose CyberTools Hub?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-primary/10 p-4 rounded-full inline-block mb-4">
                <ShieldCheck className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Professional Grade
              </h3>
              <p className="text-gray-600">
                Enterprise-level security tools with real-time analysis and accurate results.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-primary/10 p-4 rounded-full inline-block mb-4">
                <Activity className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Real-Time Results
              </h3>
              <p className="text-gray-600">
                Get instant results with live network scanning and DNS queries.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-primary/10 p-4 rounded-full inline-block mb-4">
                <Lock className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Secure & Private
              </h3>
              <p className="text-gray-600">
                Your data is protected with enterprise-grade security and privacy measures.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Secure Your Network?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of security professionals using CyberTools Hub.
          </p>
          <Link href="/register" className="btn-primary inline-flex items-center space-x-2">
            <span>Create Free Account</span>
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">CyberTools Hub</h3>
              <p className="text-gray-400">
                Professional cyber security tools for network analysis and reconnaissance.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Tools</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/tools/port-scan" className="hover:text-primary">Port Scanner</Link></li>
                <li><Link href="/tools/dns-lookup" className="hover:text-primary">DNS Lookup</Link></li>
                <li><Link href="/tools/whois" className="hover:text-primary">WHOIS</Link></li>
                <li><Link href="/tools/ping" className="hover:text-primary">Ping Test</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Account</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/login" className="hover:text-primary">Login</Link></li>
                <li><Link href="/register" className="hover:text-primary">Register</Link></li>
                <li><Link href="/profile" className="hover:text-primary">Profile</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/privacy" className="hover:text-primary">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-primary">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 CyberTools Hub. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function Home() {
  return (
    <section className="space-y-8">
      {/* <div className="flex flex-col items-start gap-4">
        <h1 className="text-3xl font-semibold">Welcome</h1>
        <p className="text-(--muted-text)">
          This site is a minimal academic profile with publications, talks, teaching, and a simple blog. It aims for clarity, fast navigation, and a layout that keeps key information within easy reach.
        </p>
      </div> */}

      <div className="prose max-w-none dark:prose-invert text-(--text) [--tw-prose-body:var(--text)] [--tw-prose-headings:var(--text)] [--tw-prose-links:var(--link)] [--tw-prose-quotes:var(--muted-text)]">
        <h2>Summary</h2>
        <p>
I am a postdoctoral researcher at Boston University’s Department of Electrical & Computer Engineering, working with the Performance and Energy-Aware Computing Lab 
(PEACLab) led by Prof. Ayşe Coşkun. My work centers on building sustainable, grid-interactive AI infrastructure by bridging computer systems, energy systems, and climate-aligned operational strategies. 
I design data-center-scale frameworks, tools, and control mechanisms that make AI workloads power-aware, demand-responsive, and carbon-optimized, demonstrating that traditional, efficiency-agnostic approaches to AI and HPC computing are incompatible with rapidly growing AI demand, constrained energy availability, and net-zero carbon requirements. 

To address this gap, I develop new abstractions, metrics, runtime controllers, and multi-data-center coordination mechanisms that embed sustainability as a first-class design principle in modern computing systems.        
</p>

<h2>Experience</h2>
<p>
 Prior to joining Boston University as a post-doctoral researcher in 2024, I held several roles in the industry from 2013 to 2021. 
 I served as a Power Management Architect at AMD, Power/Thermal Architect at Samsung Austin Research Center (SARC) and Post-silicon Power/Thermal Optimization Engineer at Qualcomm. I was also the founder of a startup company, where I built SaaS solutions for financial institutions and retail investors. I successfully exited my startup in 2023.

I hold a PhD degree in Computer Engineering from Boston University (2015) and a MSc degree (2010) in Electrical & Computer Engineering from University of Southern California.
</p>
      </div>
    </section>
  );
}

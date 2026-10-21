// Guided journeys: short paths through the stack, one step at a time. Each step names the products
// it lights up and says, in a few sentences, what the reader should take from them. Every claim
// here comes from the same sources as the product entries in stack.js; where the underlying link is
// unverified, the step says so.

export const JOURNEYS = [
  {
    id: 'build',
    title: 'Build an AI cluster',
    blurb: 'From a validated design down to the silicon, then how it is run.',
    steps: [
      {
        title: 'Start from a validated design',
        nodes: ['secure-ai-factory', 'ai-pod', 'pod-2-8-9-400', 'pod-2-8-5-200'],
        text: 'The Secure AI Factory with NVIDIA bundles compute, network, software, storage, security and observability. AI PODs are its pre-validated infrastructure, and each published design, such as the 2-8-9-400 enterprise design, fixes the servers and switches. The 2-8-5-200 design is not yet confirmed against a public page.',
      },
      {
        title: 'Choose the GPU servers',
        nodes: ['pod-2-8-9-400', 'pod-2-8-5-200', 'c885a', 'c845a', 'nvidia-gpu', 'bluefield'],
        text: 'The 2-8-9-400 design uses UCS C885A M8 servers: eight HGX GPUs, two AMD EPYC CPUs and BlueField adapters for the external links. The smaller 2-8-5-200 design uses the C845A, which is not yet confirmed against a public page.',
      },
      {
        title: 'Connect them with a lossless fabric',
        nodes: ['c885a', 'bluefield', 'n9364e', 'nexus-9000', 'spectrum-x', 'silicon-one'],
        text: 'Nexus 9364E-SG2 switches, 64 ports of 800G, carry lossless RoCE Ethernet for the back-end GPU fabric and the front-end network. Cisco Silicon One switches take part in NVIDIA Spectrum-X. Sources disagree on exactly which ASIC is in the 9364E-SG2.',
      },
      {
        title: 'Add storage',
        nodes: ['nexus-9000', 'netapp', 'pure', 'vast', 'hitachi', 'nutanix', 'ai-pod', 'secure-ai-factory'],
        text: 'Storage traffic rides the front-end network. NetApp published a validated design for the AI POD; Pure Storage, VAST Data, Hitachi Vantara and Nutanix are storage partners for the Secure AI Factory.',
      },
      {
        title: 'Run the workloads',
        nodes: ['nvidia-ai-enterprise', 'nvidia-gpu', 'openshift', 'kubernetes', 'nutanix', 'isovalent'],
        text: 'NVIDIA AI Enterprise is the software layer that drives the GPUs. It runs on Kubernetes: Red Hat OpenShift, Nutanix NKP or upstream. Isovalent (Cilium) is the cluster\'s network layer, which is not yet confirmed against a public page.',
      },
      {
        title: 'Manage it',
        nodes: ['ai-pod', 'intersight', 'nexus-dashboard', 'hyperfabric', 'n9364e'],
        text: 'Intersight manages the compute. The fabric is managed on premises through Nexus Dashboard, or as a cloud service through Nexus Hyperfabric AI.',
      },
    ],
  },
  {
    id: 'secure',
    title: 'Secure it',
    blurb: 'Protection from the model down to the SOC.',
    steps: [
      {
        title: 'Protect models and agents',
        nodes: ['ai-defense', 'nvidia-ai-enterprise', 'secure-ai-factory'],
        text: 'Cisco AI Defense secures AI models, agents and applications, and is integrated with NVIDIA AI in the Secure AI Factory.',
      },
      {
        title: 'Enforce at the workload',
        nodes: ['hybrid-mesh-fw', 'secure-firewall', 'bluefield'],
        text: 'The Hybrid Mesh Firewall runs its enforcement on NVIDIA BlueField DPUs, close to the workload, and includes Cisco\'s Secure Firewall line.',
      },
      {
        title: 'Watch inside the cluster',
        nodes: ['isovalent-runtime', 'isovalent', 'kubernetes'],
        text: 'Isovalent Runtime Security gives runtime visibility and enforcement for the Kubernetes workloads that run models and agents. Isovalent\'s place in the cluster, and its links to Kubernetes, are not yet confirmed against a public page.',
      },
      {
        title: 'Detect and respond',
        nodes: ['splunk-es', 'xdr', 'foundation-ai', 'ai-defense'],
        text: 'Splunk Enterprise Security and Cisco XDR handle detection, investigation and response. Foundation-sec-8B, an open security model, was demonstrated as a virtual SOC analyst running investigations in XDR. The links from AI Defense and XDR into Splunk are not yet confirmed against a public page.',
      },
    ],
  },
  {
    id: 'operate',
    title: 'Operate it',
    blurb: 'From telemetry to AI-driven operations.',
    steps: [
      {
        title: 'See the infrastructure',
        nodes: ['splunk-obs', 'ai-pod', 'agntcy'],
        text: 'Splunk Observability gives visibility into the health of the AI infrastructure and, in the case of agents, how they perform. The link to agent performance is not yet confirmed against a public page.',
      },
      {
        title: 'Bring the data together',
        nodes: ['splunk-obs', 'thousandeyes', 'ai-canvas'],
        text: 'AI Canvas, the generative workspace at the centre of Cisco\'s AgenticOps model, draws on Splunk and on telemetry sources such as ThousandEyes. The ThousandEyes link is not yet confirmed against a public page.',
      },
      {
        title: 'Act through the controllers',
        nodes: ['ai-canvas', 'nexus-dashboard', 'intersight'],
        text: 'From the one workspace, operations reach into the domain controllers: Nexus Dashboard for the fabric and Intersight for compute. Both of those links are not yet confirmed against a public page.',
      },
      {
        title: 'Connect the agents',
        nodes: ['ai-canvas', 'agntcy', 'splunk-obs'],
        text: 'AGNTCY, the open Internet of Agents project now at the Linux Foundation, gives agents identity, discovery, messaging and observability. AgenticOps leans on its components. Splunk\'s view of agent performance is not yet confirmed against a public page.',
      },
    ],
  },
];

// The Cisco AI stack as data: layers, products (nodes) and the integrations (links) between them.
//
// Every node and link carries a `status`:
//   'sourced' - stated on a Cisco or partner page / design guide listed in SOURCES
//   'check'   - believed correct but not confirmed against a public page; the UI says so
// Nothing here is a roadmap claim. Product names move, so re-check before presenting.

export const SOURCES = {
  factory: 'https://www.cisco.com/site/us/en/solutions/artificial-intelligence/secure-ai-factory/index.html',
  pods: 'https://www.cisco.com/site/us/en/solutions/artificial-intelligence/infrastructure/ai-pods.html',
  pod2894: 'https://www.cisco.com/c/en/us/products/collateral/servers-unified-computing/ai-pod-ucs-c885a-servers-nexus-9364e-sg2-switches.html',
  netapp: 'https://www.netapp.com/media/164712-nva-1186-design-cisco-ai-pod.pdf',
  canvas: 'https://newsroom.cisco.com/c/r/newsroom/en/us/a/y2025/m06/announcing-cisco-ai-canvas-revolutionizing-it-with-agenticops.html',
  agntcy: 'https://docs.agntcy.org',
  outshift: 'https://outshift.cisco.com/blog/building-the-internet-of-agents-introducing-the-AGNTCY',
  foundation: 'https://www.sdxcentral.com/news/cisco-demos-practical-agentic-ai-for-soc-automation/',
};

// How the stack is drawn. `group` places a layer: 'frame' wraps everything (the validated
// designs), 'stack' is a band in the vertical stack (top is closest to the workload, bottom is
// silicon), and 'cross' runs alongside every band. Order within a group is top to bottom.
export const LAYERS = [
  { id: 'design', group: 'frame', name: 'Validated designs',
    summary: 'Pre-tested combinations of the layers below, sold as complete stacks or as individual parts.' },
  { id: 'platform', group: 'stack', name: 'Platform',
    summary: 'Kubernetes, the GPU software stack and cluster networking that models and agents run on.' },
  { id: 'data', group: 'stack', name: 'Data and storage',
    summary: 'Storage partners validated with the stack for datasets and model data.' },
  { id: 'network', group: 'stack', name: 'Network fabric',
    summary: 'Lossless Ethernet for GPU-to-GPU traffic and the front-end network, with the controllers that manage it.' },
  { id: 'compute', group: 'stack', name: 'Compute',
    summary: 'GPU servers and the management plane that provisions and monitors them.' },
  { id: 'silicon', group: 'stack', name: 'Silicon and accelerators',
    summary: 'The switch silicon, GPUs and DPUs that everything above is built on.' },
  { id: 'security', group: 'cross', name: 'Security',
    summary: 'Protects models, agents, workloads and the network, from runtime enforcement to the SOC.' },
  { id: 'ops', group: 'cross', name: 'Operations and agents',
    summary: 'Observability, AI-driven operations and the open protocols agents use to find and talk to each other.' },
];

// vendor: 'cisco' is marked with a filled dot, 'partner' with an open one.
export const NODES = [
  // Validated designs
  { id: 'secure-ai-factory', name: 'Secure AI Factory with NVIDIA', layer: 'design', vendor: 'cisco', status: 'sourced', url: SOURCES.factory,
    blurb: 'Reference architecture that bundles compute, network, software, storage, security and observability. Sold as pre-validated stacks or as individual parts.' },
  { id: 'ai-pod', name: 'Cisco AI PODs', layer: 'design', vendor: 'cisco', status: 'sourced', url: SOURCES.pods,
    blurb: 'Pre-validated building blocks of Nexus 9000 switching, UCS compute and Intersight management. Managed on premises through Nexus Dashboard, or cloud-managed through Nexus Hyperfabric.' },
  { id: 'pod-2-8-9-400', name: 'AI POD 2-8-9-400', layer: 'design', vendor: 'cisco', status: 'sourced', url: SOURCES.pod2894,
    blurb: 'Enterprise design on UCS C885A servers and Nexus 9364E-SG2 switches, compliant with the NVIDIA Enterprise Reference Architecture.' },
  { id: 'pod-2-8-5-200', name: 'AI POD 2-8-5-200', layer: 'design', vendor: 'cisco', status: 'check', url: SOURCES.pods,
    blurb: 'Smaller enterprise design built on UCS C845A servers with a 200G back-end.' },

  // Silicon and accelerators
  { id: 'silicon-one', name: 'Silicon One G200', layer: 'silicon', vendor: 'cisco', status: 'check', url: SOURCES.pod2894,
    blurb: 'Cisco\'s own switch silicon. Sources disagree on exactly which ASIC sits in the 9364E-SG2, so confirm before quoting it.' },
  { id: 'nvidia-gpu', name: 'NVIDIA HGX GPUs', layer: 'silicon', vendor: 'partner', status: 'sourced', url: SOURCES.pod2894,
    blurb: 'Eight-GPU HGX baseboards (H200 in the C885A guide). The accelerator everything else in the stack exists to feed.' },
  { id: 'bluefield', name: 'NVIDIA BlueField DPU', layer: 'silicon', vendor: 'partner', status: 'sourced', url: SOURCES.factory,
    blurb: 'Network adapter and DPU. Carries the external links on the C885A and hosts the Hybrid Mesh Firewall enforcement point.' },
  { id: 'spectrum-x', name: 'NVIDIA Spectrum-X', layer: 'silicon', vendor: 'partner', status: 'sourced', url: SOURCES.pod2894,
    blurb: 'NVIDIA\'s Ethernet platform for AI. Cisco switches built on Silicon One participate in it.' },

  // Compute
  { id: 'c885a', name: 'UCS C885A M8', layer: 'compute', vendor: 'cisco', status: 'sourced', url: SOURCES.pod2894,
    blurb: 'Eight-GPU HGX server with two AMD EPYC CPUs, up to 3 TB of memory and local NVMe, and BlueField adapters.' },
  { id: 'c845a', name: 'UCS C845A M8', layer: 'compute', vendor: 'cisco', status: 'check', url: SOURCES.pods,
    blurb: 'MGX-based GPU server used in the smaller 2-8-5-200 design.' },
  { id: 'ucs-x', name: 'UCS X-Series', layer: 'compute', vendor: 'cisco', status: 'sourced', url: SOURCES.pods,
    blurb: 'Modular compute that the AI PODs page lists alongside the rack servers.' },
  { id: 'intersight', name: 'Intersight', layer: 'compute', vendor: 'cisco', status: 'sourced', url: SOURCES.pods,
    blurb: 'SaaS lifecycle and policy management for UCS servers, and the management plane behind the AI PODs.' },

  // Network fabric
  { id: 'n9364e', name: 'Nexus 9364E-SG2', layer: 'network', vendor: 'cisco', status: 'sourced', url: SOURCES.pod2894,
    blurb: '64-port 800G switch. Carries lossless RoCE Ethernet for the back-end GPU fabric and the front-end network for storage and users.' },
  { id: 'nexus-9000', name: 'Nexus 9000', layer: 'network', vendor: 'cisco', status: 'sourced', url: SOURCES.pods,
    blurb: 'The data center switching family the AI PODs are built on.' },
  { id: 'hyperfabric', name: 'Nexus Hyperfabric AI', layer: 'network', vendor: 'cisco', status: 'sourced', url: SOURCES.factory,
    blurb: 'Cloud-managed fabric delivered as a service. The cloud-managed alternative for an AI POD.' },
  { id: 'nexus-dashboard', name: 'Nexus Dashboard', layer: 'network', vendor: 'cisco', status: 'sourced', url: SOURCES.factory,
    blurb: 'On-premises controller and operations console for Nexus fabrics. Manages the on-prem AI POD.' },

  // Data and storage
  { id: 'netapp', name: 'NetApp', layer: 'data', vendor: 'partner', status: 'sourced', url: SOURCES.netapp,
    blurb: 'Published a validated design for the Cisco AI POD (NVA-1186).' },
  { id: 'pure', name: 'Pure Storage', layer: 'data', vendor: 'partner', status: 'sourced', url: SOURCES.factory,
    blurb: 'Storage partner for the Secure AI Factory.' },
  { id: 'vast', name: 'VAST Data', layer: 'data', vendor: 'partner', status: 'sourced', url: SOURCES.factory,
    blurb: 'Storage partner for the Secure AI Factory.' },
  { id: 'hitachi', name: 'Hitachi Vantara', layer: 'data', vendor: 'partner', status: 'sourced', url: SOURCES.factory,
    blurb: 'Storage partner for the Secure AI Factory.' },
  { id: 'nutanix', name: 'Nutanix', layer: 'data', vendor: 'partner', status: 'sourced', url: SOURCES.factory,
    blurb: 'Storage partner, and its NKP is one of the supported Kubernetes platforms.' },

  // Platform
  { id: 'nvidia-ai-enterprise', name: 'NVIDIA AI Enterprise', layer: 'platform', vendor: 'partner', status: 'sourced', url: SOURCES.factory,
    blurb: 'NVIDIA\'s supported software layer: NIM microservices, frameworks and GPU operators.' },
  { id: 'openshift', name: 'Red Hat OpenShift', layer: 'platform', vendor: 'partner', status: 'sourced', url: SOURCES.factory,
    blurb: 'Kubernetes option for the stack. Red Hat AI Factory is also supported.' },
  { id: 'kubernetes', name: 'Kubernetes', layer: 'platform', vendor: 'partner', status: 'sourced', url: SOURCES.factory,
    blurb: 'Upstream open-source Kubernetes is a supported option beside OpenShift and Nutanix NKP.' },
  { id: 'isovalent', name: 'Isovalent', layer: 'platform', vendor: 'cisco', status: 'check', url: SOURCES.factory,
    blurb: 'Cilium-based networking and observability for Kubernetes clusters.' },

  // Security
  { id: 'ai-defense', name: 'Cisco AI Defense', layer: 'security', vendor: 'cisco', status: 'sourced', url: SOURCES.factory,
    blurb: 'Secures AI models, agents and applications. Integrated with NVIDIA AI in the Secure AI Factory.' },
  { id: 'hybrid-mesh-fw', name: 'Hybrid Mesh Firewall', layer: 'security', vendor: 'cisco', status: 'sourced', url: SOURCES.factory,
    blurb: 'Firewall enforcement that runs on NVIDIA BlueField DPUs, close to the workload.' },
  { id: 'secure-firewall', name: 'Secure Firewall', layer: 'security', vendor: 'cisco', status: 'sourced', url: SOURCES.factory,
    blurb: 'Cisco\'s firewall line, part of the hybrid mesh.' },
  { id: 'isovalent-runtime', name: 'Isovalent Runtime Security', layer: 'security', vendor: 'cisco', status: 'sourced', url: SOURCES.factory,
    blurb: 'Runtime security for the Kubernetes workloads that run models and agents.' },
  { id: 'splunk-es', name: 'Splunk Enterprise Security', layer: 'security', vendor: 'cisco', status: 'sourced', url: SOURCES.factory,
    blurb: 'Threat detection, investigation and response platform.' },
  { id: 'xdr', name: 'Cisco XDR', layer: 'security', vendor: 'cisco', status: 'sourced', url: SOURCES.foundation,
    blurb: 'Extended detection and response. Where the Foundation-sec agent demo ran investigations.' },
  { id: 'foundation-ai', name: 'Foundation AI (Foundation-sec-8B)', layer: 'security', vendor: 'cisco', status: 'sourced', url: SOURCES.foundation,
    blurb: 'Open-source security model, fine-tuned from Llama 3.1, wrapped in an agent that acts as a virtual SOC analyst.' },

  // Operations and agents
  { id: 'splunk-obs', name: 'Splunk Observability', layer: 'ops', vendor: 'cisco', status: 'sourced', url: SOURCES.factory,
    blurb: 'Visibility into AI infrastructure health and agent performance.' },
  { id: 'ai-canvas', name: 'AI Canvas (AgenticOps)', layer: 'ops', vendor: 'cisco', status: 'sourced', url: SOURCES.canvas,
    blurb: 'Generative UI for cross-domain IT operations; one of the three pieces of Cisco\'s AgenticOps model.' },
  { id: 'thousandeyes', name: 'ThousandEyes', layer: 'ops', vendor: 'cisco', status: 'check', url: SOURCES.canvas,
    blurb: 'Network path and internet visibility, one of the telemetry sources AI Canvas draws on.' },
  { id: 'agntcy', name: 'AGNTCY', layer: 'ops', vendor: 'cisco', status: 'sourced', url: SOURCES.agntcy,
    blurb: 'Open Internet of Agents project from Outshift, since donated to the Linux Foundation. Building blocks: identity, discovery, messaging, observability.' },
];

// Integration types. A link is directional (a to b), and `from` / `to` are how each end reads: for
// a composes link, a "Contains" b and b "Is part of" a.
export const LINK_TYPES = [
  { id: 'composes', name: 'Contains', from: 'Contains', to: 'Is part of' },
  { id: 'runs', name: 'Runs on', from: 'Runs on', to: 'Underpins' },
  { id: 'network', name: 'Carries traffic', from: 'Carries traffic for', to: 'Has traffic carried by' },
  { id: 'manages', name: 'Manages', from: 'Manages', to: 'Is managed by' },
  { id: 'secures', name: 'Secures', from: 'Secures', to: 'Is secured by' },
  { id: 'observes', name: 'Observes', from: 'Observes', to: 'Is observed by' },
  { id: 'feeds', name: 'Feeds data to', from: 'Feeds data to', to: 'Draws data from' },
];

// (a, b, type, what the integration is, status). Direction matters: see LINK_TYPES.
const L = (a, b, type, label, status = 'sourced') => ({ a, b, type, label, status });

export const LINKS = [
  // Designs
  L('secure-ai-factory', 'ai-pod', 'composes', 'AI PODs are the pre-validated infrastructure of the factory'),
  L('ai-pod', 'pod-2-8-9-400', 'composes', 'One of the published AI POD designs'),
  L('ai-pod', 'pod-2-8-5-200', 'composes', 'One of the published AI POD designs', 'check'),
  L('pod-2-8-9-400', 'c885a', 'composes', 'Compute node of the design'),
  L('pod-2-8-9-400', 'n9364e', 'composes', 'Switch of the design'),
  L('pod-2-8-5-200', 'c845a', 'composes', 'Compute node of the design', 'check'),
  L('pod-2-8-5-200', 'nexus-9000', 'composes', 'Switching for the design', 'check'),
  L('secure-ai-factory', 'ai-defense', 'composes', 'Security pillar'),
  L('secure-ai-factory', 'hybrid-mesh-fw', 'composes', 'Security pillar'),
  L('secure-ai-factory', 'isovalent-runtime', 'composes', 'Security pillar'),
  L('secure-ai-factory', 'splunk-es', 'composes', 'Security pillar'),
  L('secure-ai-factory', 'splunk-obs', 'composes', 'Observability pillar'),
  L('secure-ai-factory', 'nvidia-ai-enterprise', 'composes', 'Software pillar'),
  L('secure-ai-factory', 'pure', 'composes', 'Storage partner'),
  L('secure-ai-factory', 'vast', 'composes', 'Storage partner'),
  L('secure-ai-factory', 'hitachi', 'composes', 'Storage partner'),
  L('secure-ai-factory', 'nutanix', 'composes', 'Storage and Kubernetes partner'),
  L('ai-pod', 'netapp', 'composes', 'Validated storage design (NVA-1186)'),
  L('nexus-dashboard', 'ai-pod', 'manages', 'Manages the on-premises AI POD'),
  L('hyperfabric', 'ai-pod', 'manages', 'The cloud-managed alternative to Nexus Dashboard'),
  L('intersight', 'ai-pod', 'manages', 'Manages the compute'),

  // Silicon
  L('n9364e', 'silicon-one', 'composes', 'Switch ASIC', 'check'),
  L('spectrum-x', 'n9364e', 'composes', 'Cisco Silicon One switches take part in the Spectrum-X platform'),
  L('c885a', 'nvidia-gpu', 'composes', 'Eight HGX GPUs per server'),
  L('c845a', 'nvidia-gpu', 'composes', 'GPU baseboard', 'check'),
  L('c885a', 'bluefield', 'composes', 'BlueField adapters for external links'),
  L('spectrum-x', 'bluefield', 'composes', 'Adapter side of the Spectrum-X platform', 'check'),

  // Compute management
  L('intersight', 'c885a', 'manages', 'Server lifecycle and policy'),
  L('intersight', 'c845a', 'manages', 'Server lifecycle and policy', 'check'),
  L('intersight', 'ucs-x', 'manages', 'Server lifecycle and policy'),

  // Network
  L('nexus-9000', 'n9364e', 'composes', 'The 9364E-SG2 is a Nexus 9000 model'),
  L('n9364e', 'c885a', 'network', 'Lossless RoCE back-end fabric and front-end network'),
  L('n9364e', 'bluefield', 'network', 'Terminates on the server adapters'),
  L('nexus-dashboard', 'n9364e', 'manages', 'Fabric provisioning and operations'),
  L('nexus-9000', 'netapp', 'network', 'Storage traffic on the front-end network'),
  L('hyperfabric', 'c885a', 'network', 'Cloud-managed fabric for the GPU servers', 'check'),

  // Platform
  L('nvidia-ai-enterprise', 'nvidia-gpu', 'runs', 'Software stack that drives the GPUs', 'check'),
  L('nvidia-ai-enterprise', 'openshift', 'runs', 'Runs on Kubernetes'),
  L('nvidia-ai-enterprise', 'kubernetes', 'runs', 'Runs on Kubernetes'),
  L('nvidia-ai-enterprise', 'nutanix', 'runs', 'Runs on Nutanix NKP'),
  L('isovalent', 'kubernetes', 'runs', 'Cilium runs in the cluster as its network layer', 'check'),
  L('isovalent', 'isovalent-runtime', 'composes', 'Runtime security is part of Isovalent'),

  // Security
  L('ai-defense', 'nvidia-ai-enterprise', 'secures', 'Integrated with NVIDIA AI'),
  L('ai-defense', 'splunk-es', 'feeds', 'Findings feed detection and response', 'check'),
  L('hybrid-mesh-fw', 'bluefield', 'runs', 'Enforcement runs on the BlueField DPU'),
  L('hybrid-mesh-fw', 'secure-firewall', 'composes', 'Firewall line in the hybrid mesh'),
  L('isovalent-runtime', 'kubernetes', 'secures', 'Runtime visibility and enforcement for workloads', 'check'),
  L('xdr', 'splunk-es', 'feeds', 'Detection data is shared between the two', 'check'),
  L('foundation-ai', 'xdr', 'runs', 'The Foundation-sec agent runs its investigations in XDR'),

  // Operations and agents
  L('splunk-obs', 'ai-pod', 'observes', 'AI infrastructure health'),
  L('splunk-obs', 'agntcy', 'observes', 'Agent performance', 'check'),
  L('thousandeyes', 'ai-canvas', 'feeds', 'Telemetry source', 'check'),
  L('splunk-obs', 'ai-canvas', 'feeds', 'AI Canvas draws on Splunk'),
  L('ai-canvas', 'agntcy', 'runs', 'AgenticOps leans on AGNTCY components'),
  L('ai-canvas', 'nexus-dashboard', 'manages', 'Cross-domain operations from one workspace', 'check'),
  L('ai-canvas', 'intersight', 'manages', 'Cross-domain operations from one workspace', 'check'),
];

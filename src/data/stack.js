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
  flexpodRag: 'https://www.cisco.com/c/en/us/td/docs/unified_computing/ucs/UCS_CVDs/flexpod_rag_nim.html',
  isovalentBlog: 'https://blogs.cisco.com/datacenter/extending-infrastructure-fabric-the-journey-to-cloud-native-isovalent-networking',
  siliconOne: 'https://cisco.com/c/en/us/solutions/collateral/silicon-one/silicon-one-wp.html',
  pod285: 'https://www.cisco.com/c/en/us/products/collateral/computing/servers-unified-computing-systems/ucs-c-series-rack-servers/ai-pod-nvidia-2-8-5-200-era.html',
  c845aDs: 'https://www.cisco.com/c/en/us/products/collateral/servers-unified-computing/ucs-c-series-rack-servers/ucs-c845a-m8-rack-server-ds.html',
  flashstackRag: 'https://www.cisco.com/c/en/us/td/docs/unified_computing/ucs/UCS_CVDs/flashstack_rag_nim.html',
};

// The primitives: what an AI workload needs, each delivered by a set of products. `sector` is which
// of the six directions around the centre of the map it sits in (0 east, then clockwise).
export const PRIMITIVES = [
  { id: 'platform', name: 'Platform and runtime', label: 'Platform', sector: 4,
    summary: 'The Kubernetes platforms, and the AI software on them, that models and agents run on: model serving and inference microservices.' },
  { id: 'ops', name: 'Operations and agents', label: 'Operations', sector: 5,
    summary: 'Observability, AI-driven operations and the open protocols agents use to find and talk to each other.' },
  { id: 'security', name: 'Security', label: 'Security', sector: 0,
    summary: 'Protects models, agents, workloads and the network, from runtime enforcement to the SOC.' },
  { id: 'network', name: 'Network fabric', label: 'Network', sector: 1,
    summary: 'Lossless Ethernet for GPU-to-GPU traffic and the front-end network, the controllers that manage it, and the networking inside Kubernetes clusters.' },
  { id: 'compute', name: 'Compute and accelerators', label: 'Compute', sector: 2,
    summary: 'GPU servers, the accelerators and DPUs inside them, and the management plane that provisions and monitors them.' },
  { id: 'data', name: 'Data and storage', label: 'Data', sector: 3,
    summary: 'Storage partners validated with the stack for datasets and model data.' },
];

// kind 'design' is a validated design (a portfolio bundle); every other node is a product that sits in
// one primitive. vendor: 'cisco' is drawn filled, 'partner' open. `short` is the label used in a hex.
export const NODES = [
  // Validated designs
  { id: 'secure-ai-factory', name: 'Secure AI Factory with NVIDIA', kind: 'design', vendor: 'cisco', status: 'sourced', url: SOURCES.factory,
    blurb: 'Reference architecture that bundles compute, network, software, storage, security and observability. Sold as pre-validated stacks or as individual parts.' },
  { id: 'ai-pod', name: 'Cisco AI PODs', kind: 'design', vendor: 'cisco', status: 'sourced', url: SOURCES.pods,
    blurb: 'Pre-validated building blocks of Nexus 9000 switching, UCS compute and Intersight management. Managed on premises through Nexus Dashboard, or cloud-managed through Nexus Hyperfabric.' },
  { id: 'pod-2-8-9-400', name: 'AI POD 2-8-9-400', kind: 'design', vendor: 'cisco', status: 'sourced', url: SOURCES.pod2894,
    blurb: 'Enterprise design on UCS C885A servers and Nexus 9364E-SG2 switches, compliant with the NVIDIA Enterprise Reference Architecture.' },
  { id: 'pod-2-8-5-200', name: 'AI POD 2-8-5-200', kind: 'design', vendor: 'cisco', status: 'sourced', url: SOURCES.pod285,
    blurb: 'Cisco AI POD built to NVIDIA\'s PCIe-optimised 2-8-5-200 Enterprise Reference Architecture: UCS C845A M8 servers with RTX PRO 6000 Blackwell Server Edition or H200 NVL GPUs, from 4 to 32 nodes, on Nexus 9000 back-end and front-end fabrics.' },

  { id: 'flexpod-rag', name: 'FlexPod RAG with NVIDIA NIM', kind: 'design', vendor: 'cisco', status: 'sourced', url: SOURCES.flexpodRag,
    blurb: 'Cisco Validated Design for a retrieval-augmented generation pipeline on FlexPod Datacenter, built on NVIDIA NIM microservices and integrated with a Webex chat bot.',
    bom: [
      'UCS X9508 chassis with 6 \u00d7 UCS X210c M7 compute nodes',
      '2 \u00d7 UCS X440p PCIe nodes, each with 2 \u00d7 NVIDIA L40S GPUs',
      '2 \u00d7 UCS S9108 fabric interconnects',
      '2 \u00d7 Nexus 93600CD-GX switches',
      'NetApp AFF C800 HA pair running ONTAP 9.14.1',
      'Cisco Intersight (Intersight Managed Mode) with Intersight Assist',
      'Red Hat OpenShift 4.16 on bare metal',
      'NVIDIA AI Enterprise, with NIM for LLMs and for text embedding',
    ],
    offMap: ['Cisco Webex chat bot', 'Milvus vector database', 'NetApp Trident, DataOps Toolkit and Active IQ Unified Manager'] },
  { id: 'flashstack-rag', name: 'FlashStack RAG with NVIDIA NIM', kind: 'design', vendor: 'cisco', status: 'sourced', url: SOURCES.flashstackRag,
    blurb: 'Cisco Validated Design for an enterprise RAG pipeline on FlashStack, using the NVIDIA AI Blueprint for RAG and NIM microservices, to make deployment faster and less complex.',
    bom: [
      'UCS X9508 chassis with 6 \u00d7 UCS X210c M7 compute nodes',
      '2 \u00d7 UCS X440p PCIe nodes, each with 2 \u00d7 NVIDIA L40S GPUs',
      'UCS 6536 fabric interconnects',
      'Nexus 93600CD-GX switches',
      'Pure Storage FlashArray//XL170 and FlashBlade//S200',
      'Cisco Intersight (Intersight Managed Mode) with Intersight Assist',
      'Red Hat OpenShift 4.17 on bare metal',
      'NVIDIA AI Enterprise, with NIM for LLMs, text embedding and reranking, the NIM Operator and the AI Blueprint for RAG',
    ],
    offMap: ['Cisco Webex chat bot (an example integration)', 'Milvus vector database', 'Portworx Enterprise', 'Cisco MDS (named as a FlashStack component, not detailed)'] },

  // Silicon and accelerators
  { id: 'silicon-one', name: 'Cisco Silicon One', primitive: 'network', vendor: 'cisco', status: 'sourced', url: SOURCES.siliconOne,
    blurb: 'Cisco\'s own switch silicon family, which the Nexus 9364E-SG2 and the Hyperfabric HF6100 switches are built on. The G200 is one member: a 51.2 Tbps programmable chip.' },
  { id: 'nvidia-gpu', name: 'NVIDIA GPUs', primitive: 'compute', vendor: 'partner', status: 'sourced', url: SOURCES.pod2894,
    blurb: 'The accelerator everything else in the stack exists to feed: eight-GPU HGX baseboards in the C885A (H200 in its guide), and L40S GPUs in the X440p PCIe nodes of UCS X-Series.' },
  { id: 'bluefield', name: 'NVIDIA BlueField DPU', primitive: 'compute', vendor: 'partner', status: 'sourced', url: SOURCES.factory,
    blurb: 'Network adapter and DPU. Carries the external links on the C885A and hosts the Hybrid Mesh Firewall enforcement point.' },
  { id: 'spectrum-x', name: 'NVIDIA Spectrum-X', primitive: 'network', vendor: 'partner', status: 'sourced', url: SOURCES.pod2894,
    blurb: 'NVIDIA\'s Ethernet platform for AI. Cisco switches built on Silicon One participate in it.' },

  // Compute
  { id: 'c885a', name: 'UCS C885A M8', primitive: 'compute', vendor: 'cisco', status: 'sourced', url: SOURCES.pod2894,
    blurb: 'Eight-GPU HGX server with two AMD EPYC CPUs, up to 3 TB of memory and local NVMe, and BlueField adapters.' },
  { id: 'c845a', name: 'UCS C845A M8', primitive: 'compute', vendor: 'cisco', status: 'sourced', url: SOURCES.c845aDs,
    blurb: 'MGX-based 4RU GPU server that takes two to eight PCIe GPUs, for fine-tuning, RAG and inference. Part of the AI PODs and the VAST AI OS design.' },
  { id: 'ucs-x', name: 'UCS X-Series', primitive: 'compute', vendor: 'cisco', status: 'sourced', url: SOURCES.flashstackRag,
    blurb: 'Modular compute: the X9508 chassis with X210c M7 compute nodes and X440p PCIe nodes that carry NVIDIA GPUs. The base of the FlexPod and FlashStack RAG designs, and listed on the AI PODs page.' },
  { id: 'intersight', name: 'Intersight', primitive: 'compute', vendor: 'cisco', status: 'sourced', url: SOURCES.pods,
    blurb: 'SaaS lifecycle and policy management for UCS servers, and the management plane behind the AI PODs.' },

  // Network fabric
  { id: 'n9364e', name: 'Nexus 9364E-SG2', primitive: 'network', vendor: 'cisco', status: 'sourced', url: SOURCES.pod2894,
    blurb: '64-port 800G switch. Carries lossless RoCE Ethernet for the back-end GPU fabric and the front-end network for storage and users.' },
  { id: 'nexus-9000', name: 'Nexus 9000', primitive: 'network', vendor: 'cisco', status: 'sourced', url: SOURCES.pods,
    blurb: 'The data center switching family the AI PODs are built on.' },
  { id: 'hyperfabric', name: 'Nexus Hyperfabric AI', primitive: 'network', vendor: 'cisco', status: 'sourced', url: SOURCES.factory,
    blurb: 'Cloud-managed fabric delivered as a service. The cloud-managed alternative for an AI POD.' },
  { id: 'ucs-fi', name: 'UCS Fabric Interconnects', primitive: 'network', vendor: 'cisco', status: 'sourced', url: SOURCES.flashstackRag,
    blurb: 'Connect the UCS X-Series chassis to the network and run it in Intersight Managed Mode: UCS 6536 in the FlashStack design, UCS S9108 in the FlexPod design.' },
  { id: 'nexus-dashboard', name: 'Nexus Dashboard', primitive: 'network', vendor: 'cisco', status: 'sourced', url: SOURCES.factory,
    blurb: 'On-premises controller and operations console for Nexus fabrics. Manages the on-prem AI POD.' },

  // Data and storage
  { id: 'netapp', name: 'NetApp', primitive: 'data', vendor: 'partner', status: 'sourced', url: SOURCES.netapp,
    blurb: 'Published a validated design for the Cisco AI POD (NVA-1186).' },
  { id: 'pure', name: 'Everpure (Pure Storage)', short: 'Everpure', primitive: 'data', vendor: 'partner', status: 'sourced', url: SOURCES.factory,
    blurb: 'Formerly Pure Storage, renamed in 2026. Storage partner for the Secure AI Factory, and the storage in the FlashStack designs.' },
  { id: 'vast', name: 'VAST Data', primitive: 'data', vendor: 'partner', status: 'sourced', url: SOURCES.factory,
    blurb: 'Storage partner for the Secure AI Factory.' },
  { id: 'hitachi', name: 'Hitachi Vantara', primitive: 'data', vendor: 'partner', status: 'sourced', url: SOURCES.factory,
    blurb: 'Storage partner for the Secure AI Factory.' },
  { id: 'nutanix', name: 'Nutanix', primitive: 'platform', vendor: 'partner', status: 'sourced', url: SOURCES.factory,
    blurb: 'Kubernetes platform (NKP) and AI services (Nutanix Enterprise AI) for the stack, alongside OpenShift, and also a storage partner.' },

  // Platform
  { id: 'nvidia-ai-enterprise', name: 'NVIDIA AI Enterprise', primitive: 'platform', vendor: 'partner', status: 'sourced', url: SOURCES.factory,
    blurb: 'NVIDIA\'s supported software layer: NIM microservices, frameworks and GPU operators.' },
  { id: 'openshift', name: 'Red Hat OpenShift', primitive: 'platform', vendor: 'partner', status: 'sourced', url: SOURCES.factory,
    blurb: 'Kubernetes option for the stack. Red Hat AI Factory is also supported.' },
  { id: 'kubernetes', name: 'Kubernetes', primitive: 'platform', vendor: 'partner', status: 'sourced', url: SOURCES.factory,
    blurb: 'Upstream open-source Kubernetes is a supported option beside OpenShift and Nutanix NKP.' },
  { id: 'isovalent', name: 'Isovalent Networking', primitive: 'network', vendor: 'cisco', status: 'sourced', url: SOURCES.isovalentBlog,
    blurb: 'Cilium-based cloud-native networking, security and observability for Kubernetes: the software layer that extends the data center network into the cluster.' },

  // Security
  { id: 'ai-defense', name: 'Cisco AI Defense', primitive: 'security', vendor: 'cisco', status: 'sourced', url: SOURCES.factory,
    blurb: 'Secures AI models, agents and applications. Integrated with NVIDIA AI in the Secure AI Factory.' },
  { id: 'hybrid-mesh-fw', name: 'Hybrid Mesh Firewall', primitive: 'security', vendor: 'cisco', status: 'sourced', url: SOURCES.factory,
    blurb: 'Firewall enforcement that runs on NVIDIA BlueField DPUs, close to the workload.' },
  { id: 'secure-firewall', name: 'Secure Firewall', primitive: 'security', vendor: 'cisco', status: 'sourced', url: SOURCES.factory,
    blurb: 'Cisco\'s firewall line, part of the hybrid mesh.' },
  { id: 'isovalent-runtime', name: 'Isovalent Runtime Security', primitive: 'security', vendor: 'cisco', status: 'sourced', url: SOURCES.factory,
    blurb: 'Runtime security for the Kubernetes workloads that run models and agents.' },
  { id: 'splunk-es', name: 'Splunk Enterprise Security', primitive: 'security', vendor: 'cisco', status: 'sourced', url: SOURCES.factory,
    blurb: 'Threat detection, investigation and response platform.' },
  { id: 'xdr', name: 'Cisco XDR', primitive: 'security', vendor: 'cisco', status: 'sourced', url: SOURCES.foundation,
    blurb: 'Extended detection and response. Where the Foundation-sec agent demo ran investigations.' },
  { id: 'foundation-ai', name: 'Foundation AI (Foundation-sec-8B)', short: 'Foundation AI', primitive: 'security', vendor: 'cisco', status: 'sourced', url: SOURCES.foundation,
    blurb: 'Open-source security model, fine-tuned from Llama 3.1, wrapped in an agent that acts as a virtual SOC analyst.' },

  // Operations and agents
  { id: 'splunk-obs', name: 'Splunk Observability', primitive: 'ops', vendor: 'cisco', status: 'sourced', url: SOURCES.factory,
    blurb: 'Visibility into AI infrastructure health and agent performance.' },
  { id: 'ai-canvas', name: 'AI Canvas (AgenticOps)', short: 'AI Canvas', primitive: 'ops', vendor: 'cisco', status: 'sourced', url: SOURCES.canvas,
    blurb: 'Generative UI for cross-domain IT operations; one of the three pieces of Cisco\'s AgenticOps model.' },
  { id: 'thousandeyes', name: 'ThousandEyes', primitive: 'ops', vendor: 'cisco', status: 'sourced', url: SOURCES.canvas,
    blurb: 'Network path and internet visibility, one of the telemetry sources AI Canvas draws on.' },
  { id: 'agntcy', name: 'AGNTCY', primitive: 'ops', vendor: 'cisco', status: 'sourced', url: SOURCES.agntcy,
    blurb: 'Open Internet of Agents project from Outshift, since donated to the Linux Foundation. Building blocks: identity, discovery, messaging, observability.' },
];

// Integration types. A link is directional (a to b), and `from` / `to` are how each end reads: for
// a composes link, a "Contains" b and b "Is part of" a. Only `composes` counts towards what a
// validated design includes; `models` (a product family and one of its models) does not, because a
// design that uses the family has not necessarily used every model.
export const LINK_TYPES = [
  { id: 'composes', name: 'Contains', from: 'Contains', to: 'Is part of' },
  { id: 'models', name: 'Includes the model', from: 'Includes the model', to: 'Is a model of' },
  { id: 'runs', name: 'Runs on', from: 'Runs on', to: 'Underpins' },
  { id: 'network', name: 'Carries traffic', from: 'Carries traffic for', to: 'Has traffic carried by' },
  { id: 'manages', name: 'Manages', from: 'Manages', to: 'Is managed by' },
  { id: 'secures', name: 'Secures', from: 'Secures', to: 'Is secured by' },
  { id: 'observes', name: 'Observes', from: 'Observes', to: 'Is observed by' },
  { id: 'feeds', name: 'Feeds data to', from: 'Feeds data to', to: 'Draws data from' },
  { id: 'stores', name: 'Stores data for', from: 'Stores data for', to: 'Has its data stored by' },
];

// (a, b, type, what the integration is, status). Direction matters: see LINK_TYPES.
const L = (a, b, type, label, status = 'sourced') => ({ a, b, type, label, status });

export const LINKS = [
  // Designs
  L('flexpod-rag', 'ucs-x', 'composes', 'Compute: X9508 chassis, X210c M7 nodes and X440p GPU nodes'),
  L('flexpod-rag', 'ucs-fi', 'composes', 'Connects the chassis to the network'),
  L('flexpod-rag', 'nexus-9000', 'composes', 'Nexus 93600CD-GX switching'),
  L('flexpod-rag', 'intersight', 'composes', 'Infrastructure management, in Intersight Managed Mode'),
  L('flexpod-rag', 'openshift', 'composes', 'Kubernetes platform, on bare metal'),
  L('flexpod-rag', 'nvidia-ai-enterprise', 'composes', 'NVIDIA AI Enterprise with NIM microservices'),
  L('flexpod-rag', 'netapp', 'composes', 'Storage: NetApp AFF C800'),
  L('flashstack-rag', 'ucs-x', 'composes', 'Compute: X9508 chassis, X210c M7 nodes and X440p GPU nodes'),
  L('flashstack-rag', 'ucs-fi', 'composes', 'Connects the chassis to the network'),
  L('flashstack-rag', 'nexus-9000', 'composes', 'Nexus 93600CD-GX switching'),
  L('flashstack-rag', 'intersight', 'composes', 'Infrastructure management, in Intersight Managed Mode'),
  L('flashstack-rag', 'openshift', 'composes', 'Kubernetes platform, on bare metal'),
  L('flashstack-rag', 'nvidia-ai-enterprise', 'composes', 'NVIDIA AI Enterprise with NIM microservices'),
  L('flashstack-rag', 'pure', 'composes', 'Storage: Pure Storage FlashArray and FlashBlade'),
  L('secure-ai-factory', 'ai-pod', 'composes', 'AI PODs are the pre-validated infrastructure of the factory'),
  L('ai-pod', 'pod-2-8-9-400', 'composes', 'One of the published AI POD designs'),
  L('ai-pod', 'pod-2-8-5-200', 'composes', 'One of the published AI POD designs'),
  L('pod-2-8-9-400', 'c885a', 'composes', 'Compute node of the design'),
  L('pod-2-8-9-400', 'n9364e', 'composes', 'Switch of the design'),
  L('pod-2-8-9-400', 'intersight', 'composes', 'SaaS management for all the UCS infrastructure'),
  L('pod-2-8-9-400', 'nexus-dashboard', 'composes', 'Manages both the back-end and front-end fabrics'),
  L('pod-2-8-9-400', 'openshift', 'composes', 'Red Hat OpenShift 4.18 or higher'),
  L('pod-2-8-9-400', 'nvidia-ai-enterprise', 'composes', 'NVIDIA AI Enterprise 6.0 or later, with the GPU, Network and NIM operators'),
  L('pod-2-8-9-400', 'netapp', 'composes', 'NVIDIA-certified storage partner'),
  L('pod-2-8-9-400', 'pure', 'composes', 'NVIDIA-certified storage partner, listed as Everpure (formerly Pure Storage)'),
  L('pod-2-8-9-400', 'vast', 'composes', 'NVIDIA-certified storage partner'),
  L('pod-2-8-5-200', 'c845a', 'composes', 'Compute node of the design'),
  L('pod-2-8-5-200', 'nexus-9000', 'composes', 'Nexus 9000 Series switches in the back-end and front-end fabrics'),
  L('pod-2-8-5-200', 'intersight', 'composes', 'Manages the compute'),
  L('pod-2-8-5-200', 'nexus-dashboard', 'composes', 'Manages the two fabrics'),
  L('pod-2-8-5-200', 'netapp', 'composes', 'NVIDIA-certified external storage, connected to the front-end fabric'),
  L('pod-2-8-5-200', 'pure', 'composes', 'NVIDIA-certified external storage, listed as Everpure'),
  L('pod-2-8-5-200', 'vast', 'composes', 'NVIDIA-certified external storage'),
  L('pod-2-8-5-200', 'n9364e', 'composes', 'The back-end fabric switch (and an option for the front end)'),
  L('pod-2-8-5-200', 'bluefield', 'composes', 'BlueField-3 B3140H SuperNICs for the back end and a B3220 DPU for the front end'),
  L('pod-2-8-5-200', 'openshift', 'composes', 'Red Hat OpenShift Container Platform, with OpenShift AI'),
  L('pod-2-8-5-200', 'nvidia-ai-enterprise', 'composes', 'NVIDIA AI Enterprise, with the GPU and Network operators'),
  L('secure-ai-factory', 'ai-defense', 'composes', 'Security pillar'),
  L('secure-ai-factory', 'hybrid-mesh-fw', 'composes', 'Security pillar'),
  L('secure-ai-factory', 'isovalent-runtime', 'composes', 'Listed on an earlier version of the Secure AI Factory page; not on the current one', 'check'),
  L('secure-ai-factory', 'splunk-es', 'composes', 'Security pillar'),
  L('secure-ai-factory', 'splunk-obs', 'composes', 'Observability pillar'),
  L('secure-ai-factory', 'nvidia-ai-enterprise', 'composes', 'Software pillar'),
  L('secure-ai-factory', 'pure', 'composes', 'Storage partner, listed as Everpure on the current page'),
  L('secure-ai-factory', 'vast', 'composes', 'Storage partner'),
  L('secure-ai-factory', 'hitachi', 'composes', 'Storage partner'),
  L('secure-ai-factory', 'nutanix', 'composes', 'Kubernetes platform, AI software and storage partner'),
  L('ai-pod', 'ai-defense', 'composes', 'Listed among the AI PODs\' security and observability building blocks'),
  L('ai-pod', 'isovalent', 'composes', 'Listed among the AI PODs\' security and observability building blocks'),
  L('ai-pod', 'netapp', 'composes', 'Validated storage design (NVA-1186)'),
  L('nexus-dashboard', 'ai-pod', 'manages', 'Manages the on-premises AI POD'),
  L('hyperfabric', 'ai-pod', 'manages', 'The cloud-managed alternative to Nexus Dashboard'),
  L('intersight', 'ai-pod', 'manages', 'Manages the compute'),

  // Silicon
  L('n9364e', 'silicon-one', 'composes', 'Built on Cisco Silicon One technology'),
  L('spectrum-x', 'n9364e', 'composes', 'Spectrum-X benefits are available on Cisco Silicon One switches with the Fine Grain Load Balancing licence, when connected to BlueField-3 SuperNICs'),
  L('c885a', 'nvidia-gpu', 'composes', 'Eight HGX GPUs per server'),
  L('ucs-x', 'nvidia-gpu', 'composes', 'X440p PCIe nodes carry the GPUs (two L40S per node in the RAG designs)'),
  L('c845a', 'nvidia-gpu', 'composes', 'Two to eight PCIe GPUs'),
  L('c885a', 'bluefield', 'composes', 'BlueField adapters for external links'),
  L('spectrum-x', 'bluefield', 'composes', 'The BlueField-3 SuperNIC is the adapter side of Spectrum-X'),

  // Compute management
  L('intersight', 'c885a', 'manages', 'Server lifecycle and policy'),
  L('intersight', 'c845a', 'manages', 'Server lifecycle and policy'),
  L('intersight', 'ucs-x', 'manages', 'Server lifecycle and policy'),
  L('intersight', 'ucs-fi', 'manages', 'Runs the fabric interconnects in Intersight Managed Mode'),
  L('ucs-fi', 'ucs-x', 'network', 'Connects the chassis to the network'),
  L('nexus-9000', 'ucs-fi', 'network', 'Upstream switching for the fabric interconnects', 'check'),

  // Network
  L('nexus-9000', 'n9364e', 'models', 'The 9364E-SG2 is a Nexus 9000 model'),
  L('n9364e', 'c885a', 'network', 'Lossless RoCE back-end fabric and front-end network'),
  L('n9364e', 'bluefield', 'network', 'Back-end: each server\'s eight BlueField-3 B3140H SuperNICs connect to the leaf switches'),
  L('nexus-dashboard', 'n9364e', 'manages', 'Fabric provisioning and operations'),
  L('nexus-9000', 'netapp', 'network', 'External storage connects to the front-end Nexus fabric'),
  L('nexus-9000', 'pure', 'network', 'External storage connects to the front-end Nexus fabric'),
  L('hyperfabric', 'c885a', 'composes', 'The compute node of the full-stack option'),
  L('hyperfabric', 'silicon-one', 'composes', 'The HF6100 switches are built on Cisco Silicon One'),
  L('hyperfabric', 'spectrum-x', 'composes', 'Spectrum-X runs on the Spectrum-4 based N9164E, or on Silicon One switches with the Fine Grain Load Balancing licence'),
  L('hyperfabric', 'bluefield', 'network', 'Carries the east-west GPU traffic between the servers\' BlueField-3 SuperNICs'),
  L('hyperfabric', 'nexus-9000', 'composes', 'Cisco N9300 Series switches are among the switches it supports'),
  L('hyperfabric', 'vast', 'composes', 'Optional VAST Data storage (Cisco EBox) in the full-stack option'),
  L('hyperfabric', 'nvidia-ai-enterprise', 'composes', 'Optional AI software stack in the full-stack option'),

  // Storage and the platform it serves
  L('pure', 'openshift', 'stores', 'Portworx provides container-native persistent storage for OpenShift'),
  L('netapp', 'openshift', 'stores', 'Trident provisions persistent storage for OpenShift'),
  L('intersight', 'pure', 'observes', 'Intersight Assist connects FlashArray to Intersight; the guide does not say what Intersight does with it'),
  L('intersight', 'nexus-9000', 'observes', 'Intersight Assist connects the Nexus switches to Intersight; the guide does not say what Intersight does with them'),
  L('vast', 'c845a', 'runs', 'VAST AI OS runs on UCS C845A M8 as its compute node (CNode-X)'),
  L('nexus-9000', 'vast', 'network', 'Nexus 9300 switches connect the VAST nodes'),
  L('openshift', 'ucs-x', 'runs', 'Runs on bare metal on UCS X-Series in the RAG designs'),

  // Platform
  L('nvidia-ai-enterprise', 'nvidia-gpu', 'runs', 'GPU-accelerated software, deployed on the C885A servers with H200 GPUs in the reference architectures'),
  L('nvidia-ai-enterprise', 'openshift', 'runs', 'Runs on Kubernetes'),
  L('nvidia-ai-enterprise', 'kubernetes', 'runs', 'Runs on Kubernetes'),
  L('nvidia-ai-enterprise', 'nutanix', 'runs', 'Nutanix Enterprise AI is certified with NVIDIA AI Enterprise and NIM, and runs on NKP'),
  L('isovalent', 'kubernetes', 'runs', 'Cilium runs in the cluster as its network layer'),
  L('isovalent', 'nexus-9000', 'runs', 'Nexus provides the underlay, and Isovalent works in the software layers above it'),
  L('isovalent', 'isovalent-runtime', 'composes', 'Runtime security is part of Isovalent'),

  // Security
  L('ai-defense', 'nvidia-ai-enterprise', 'secures', 'Integrated with NVIDIA AI'),
  L('ai-defense', 'splunk-es', 'feeds', 'AI Defense events are forwarded to Splunk, and an out-of-the-box Enterprise Security detection looks for attacks on AI models'),
  L('ai-defense', 'splunk-obs', 'feeds', 'Splunk AI Security Monitoring shows AI Defense\'s runtime findings for agents (an alpha feature)'),
  L('hybrid-mesh-fw', 'bluefield', 'runs', 'Enforcement runs on the BlueField DPU'),
  L('hybrid-mesh-fw', 'secure-firewall', 'composes', 'Firewall line in the hybrid mesh'),
  L('isovalent-runtime', 'kubernetes', 'secures', 'Tetragon is Kubernetes-native: runtime visibility and enforcement for workloads'),
  L('xdr', 'splunk-es', 'feeds', 'A two-way link: XDR escalations create Enterprise Security investigations, and closures flow back'),
  L('foundation-ai', 'xdr', 'runs', 'The Foundation-sec agent runs its investigations in XDR'),

  // Operations and agents
  L('splunk-obs', 'ai-pod', 'observes', 'AI infrastructure health'),
  L('thousandeyes', 'ai-canvas', 'feeds', 'AI Canvas draws on telemetry from sources such as ThousandEyes'),
  L('splunk-obs', 'ai-canvas', 'feeds', 'AI Canvas draws on Splunk'),
  L('ai-canvas', 'agntcy', 'runs', 'AgenticOps leans on AGNTCY components (from one news report of Cisco Live Europe 2026)', 'check'),
  L('ai-canvas', 'nexus-dashboard', 'manages', 'Agents tied to Nexus Dashboard investigate in parallel; operators approve any change. Cisco\'s lists are illustrative, so which integrations ship today is unconfirmed', 'check'),
  L('ai-canvas', 'hyperfabric', 'manages', 'Agents tied to Nexus Hyperfabric investigate in parallel; operators approve any change. Which integrations ship today is unconfirmed', 'check'),
  L('ai-canvas', 'intersight', 'manages', 'Agents tied to Intersight investigate in parallel; operators approve any change. Which integrations ship today is unconfirmed', 'check'),
];

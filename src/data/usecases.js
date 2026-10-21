// Customer use cases: what a customer is trying to do, and which products it takes.
//
// Each need names one product, or several that are alternatives to each other (`products` is "any
// of"). `role` is 'required' (the scenario does not work without it) or 'recommended' (a sensible
// addition the published designs do not themselves include). `status` on the use case is:
//   'sourced' - the required needs come from the design guides listed in `designs`
//   'draft'   - an editorial reading of the vendor's published designs; review before using with a customer
// The same scenarios exist in both focuses (see usecases-nvidia.js), with the needs written in that
// focus's products. `caveat` is what to check before relying on one.
// Recommended needs are always editorial, whatever the status.

import { SOURCES } from './stack.js';

export const USE_CASES = [
  {
    id: 'enterprise-rag',
    name: 'Enterprise RAG assistant',
    status: 'sourced',
    url: SOURCES.flashstackRag,
    summary:
      'Answer questions from the company\'s own documents with a retrieval-augmented generation pipeline: NVIDIA NIM microservices for the language model, embedding and reranking, running on infrastructure the company controls, and reachable from a chat bot.',
    caveat: 'Both guides are dated (October 2024 and May 2025), use L40S GPUs and an early version of the NVIDIA RAG blueprint, and name no security or observability product. The recommended needs are editorial.',
    designs: ['flashstack-rag', 'flexpod-rag'],
    needs: [
      { products: ['ucs-x'], role: 'required', why: 'GPU-capable compute: the chassis, compute nodes and PCIe GPU nodes both guides are built on.' },
      { products: ['nvidia-gpu'], role: 'required', why: 'GPUs for inference and embedding. Both guides use two L40S per GPU node.' },
      { products: ['ucs-fi'], role: 'required', why: 'Fabric interconnects that connect the chassis to the network and run it in Intersight Managed Mode.' },
      { products: ['nexus-9000'], role: 'required', why: 'Data center switching. Both guides use Nexus 93600CD-GX.' },
      { products: ['intersight'], role: 'required', why: 'Infrastructure management for the servers and fabric interconnects.' },
      { products: ['openshift'], role: 'required', why: 'The Kubernetes platform the NIM microservices run on: OpenShift on bare metal in both guides.' },
      { products: ['nvidia-ai-enterprise'], role: 'required', why: 'NVIDIA AI Enterprise, which brings the NIM microservices: the language model and embedding in both guides, and reranking in the FlashStack guide.' },
      { products: ['netapp', 'pure'], role: 'required', why: 'Shared storage for the pipeline: NetApp in the FlexPod guide, Pure Storage in the FlashStack guide.' },
      { products: ['ai-defense'], role: 'recommended', why: 'Neither guide names a security product. AI Defense secures the models and applications a pipeline like this exposes.' },
      { products: ['isovalent-runtime'], role: 'recommended', why: 'Runtime visibility and enforcement for the Kubernetes workloads the pipeline runs as.' },
      { products: ['splunk-obs'], role: 'recommended', why: 'The guides rely on Intersight and the storage vendor\'s own monitoring. Splunk Observability adds visibility into AI infrastructure health.' },
    ],
  },
  {
    id: 'enterprise-ai-cluster',
    name: 'GPU cluster for enterprise AI',
    status: 'draft',
    url: SOURCES.pod2894,
    summary:
      'A dedicated GPU cluster for in-house inference and fine-tuning, built to the NVIDIA Enterprise Reference Architecture: eight-GPU servers joined by a lossless Ethernet fabric, managed as one system.',
    caveat: 'No Cisco page states this scenario in these words; it is an editorial reading of the two AI POD design pages. The 2-8-9-400 design suits larger training; the 2-8-5-200 design is inference first, with small-model training and fine-tuning, and tops out at 32 nodes. Both pages name OpenShift only: Nutanix and upstream Kubernetes appear on the Secure AI Factory page.',
    designs: ['pod-2-8-9-400', 'pod-2-8-5-200', 'ai-pod', 'secure-ai-factory'],
    needs: [
      { products: ['c885a', 'c845a'], role: 'required', why: 'The eight-GPU server: the C885A with HGX H200 in the 2-8-9-400 design, or the C845A with RTX PRO 6000 or H200 NVL in the 2-8-5-200 design.' },
      { products: ['nvidia-gpu'], role: 'required', why: 'Eight GPUs per server in both designs.' },
      { products: ['bluefield'], role: 'required', why: 'BlueField-3 adapters for the back-end fabric and the front-end network in both designs.' },
      { products: ['n9364e'], role: 'required', why: '64-port 800G switching for the back-end GPU fabric.' },
      { products: ['nexus-9000'], role: 'required', why: 'The front-end and management networks use other Nexus 9000 models.' },
      { products: ['intersight'], role: 'required', why: 'Lifecycle and policy management for the servers.' },
      { products: ['nexus-dashboard'], role: 'required', why: 'Fabric management for the back-end and front-end fabrics. Neither design page names Hyperfabric, which the AI PODs page offers as the cloud-managed alternative.' },
      { products: ['nvidia-ai-enterprise'], role: 'required', why: 'NVIDIA\'s supported software layer for the GPUs, with the GPU, Network and NIM operators.' },
      { products: ['openshift'], role: 'required', why: 'Both design pages specify Red Hat OpenShift as the platform that schedules workloads onto the GPUs.' },
      { products: ['netapp', 'pure', 'vast'], role: 'required', why: 'Shared storage on the front-end network, from one of the storage partners both design pages name.' },
      { products: ['ai-defense'], role: 'recommended', why: 'Secures the models and applications that run on the cluster. Only the Secure AI Factory page names it.' },
      { products: ['hybrid-mesh-fw'], role: 'recommended', why: 'Enforcement on the BlueField DPUs, close to the workload. Only the Secure AI Factory page names it, and its availability is unclear.' },
      { products: ['splunk-obs'], role: 'recommended', why: 'Visibility into AI infrastructure health. Only the Secure AI Factory page names it.' },
    ],
  },
  {
    id: 'agentic-ai',
    name: 'Agentic AI assistants',
    status: 'draft',
    url: SOURCES.agenticSo,
    summary:
      'Agents that use tools and company data and act on a user\'s behalf, run on infrastructure the company controls: an agent platform on GPU servers, a data layer the agents can search, and security that watches what the agents do.',
    caveat: 'No Cisco Validated Design tests an agent workload: Cisco\'s own Secure AI Factory case study says "No agent workload was tested". The required needs come from the Cisco, NVIDIA and VAST agentic data platform solution overview and the Secure AI Factory page. Hybrid Mesh Firewall enforcement on BlueField is in doubt: a March 2026 release says it is available, while a Cisco blog of 21 October 2026 says the BlueField security services remain in development.',
    designs: ['secure-ai-factory'],
    needs: [
      { products: ['c845a'], role: 'required', why: 'The RTX PRO server from Cisco, with BlueField, is the compute in the agentic data platform overview.' },
      { products: ['nvidia-gpu'], role: 'required', why: 'RTX PRO Blackwell Server Edition GPUs run the models and agents.' },
      { products: ['bluefield'], role: 'required', why: 'The overview\'s servers are BlueField-equipped.' },
      { products: ['nexus-9000', 'hyperfabric'], role: 'required', why: 'The fabric options the overview lists: Nexus 9000 switches, or Nexus Hyperfabric for cloud-managed networking.' },
      { products: ['nvidia-ai-enterprise'], role: 'required', why: 'The model and data-pipeline software layer in the overview and on the Secure AI Factory page.' },
      { products: ['vast'], role: 'required', why: 'VAST is the data layer in the only agentic design Cisco publishes, the NVIDIA AI Data Platform reference design on AI PODs.' },
      { products: ['openshift', 'kubernetes', 'nutanix'], role: 'required', why: 'The Secure AI Factory page lists OpenShift, Nutanix NKP or upstream Kubernetes as the platform the agents run on.' },
      { products: ['ai-defense'], role: 'required', why: 'Guards agent prompts, responses, tool calls and use of MCP servers.' },
      { products: ['splunk-obs'], role: 'required', why: 'Monitors infrastructure and agents. Splunk Agent Observability is available now, per Cisco\'s September 2026 announcement.' },
      { products: ['hybrid-mesh-fw'], role: 'recommended', why: 'The overview names a hybrid mesh firewall with Isovalent for containerised workloads and BlueField for policy offload, but BlueField enforcement is unconfirmed.' },
      { products: ['isovalent-runtime'], role: 'recommended', why: 'Runtime detection for the workloads agents run as. The overview says only "with Isovalent".' },
      { products: ['splunk-es'], role: 'recommended', why: 'Threat detection. Listed in the overview, but not specific to agents.' },
      { products: ['intersight'], role: 'recommended', why: 'Fleet management for the compute. Named on the Secure AI Factory page, not the overview.' },
      { products: ['agntcy'], role: 'recommended', why: 'Open agent identity, discovery and messaging. Cisco has demonstrated it on two AI PODs, but no design guide includes it.' },
    ],
  },
  {
    id: 'secure-private-ai',
    name: 'Secure private AI for regulated data',
    status: 'sourced',
    url: SOURCES.safCaseStudy,
    summary:
      'AI that runs on the customer\'s own infrastructure because the data cannot leave, with security built in at each layer: protection for the models and applications, enforcement between workloads, and detection and response.',
    caveat: 'Lab-validated, not certified. Cisco\'s case study calls itself "not a fully hardened production deployment": one data-leak test partly failed and the edge firewall was racked but not configured. AI Defense uses a cloud control plane and needs outbound access, so this is a private data plane, not an air gap. Cisco claims no compliance certification for the stack.',
    designs: ['secure-ai-factory'],
    needs: [
      { products: ['c845a'], role: 'required', why: 'The UCS C845A is the worker node in the AI Defense on AI PODs design; the case study uses UCS servers with NVIDIA GPUs.' },
      { products: ['nvidia-gpu'], role: 'required', why: 'GPUs for the models: L40S in the AI Defense design.' },
      { products: ['nexus-9000'], role: 'required', why: 'The case study\'s Nexus 9000 fabric, with VXLAN-EVPN separating the two clusters.' },
      { products: ['openshift'], role: 'required', why: 'Both documents run on Red Hat OpenShift 4.18 or later.' },
      { products: ['nvidia-ai-enterprise'], role: 'required', why: 'The case study runs NIM and NeMo, which ship in NVIDIA AI Enterprise. The case study itself does not name AI Enterprise.' },
      { products: ['bluefield'], role: 'required', why: 'BlueField-3 on the north-south data plane. The case study does not validate BlueField as a security control.' },
      { products: ['ai-defense'], role: 'required', why: 'Validates models and applications and guards them at runtime, with the data plane on the AI POD.' },
      { products: ['isovalent-runtime'], role: 'required', why: 'Identity-based network policy, flow visibility and runtime detection between workloads.' },
      { products: ['splunk-es'], role: 'required', why: 'Detection and investigation: the case study sends its events to Splunk Enterprise Security.' },
      { products: ['splunk-obs'], role: 'required', why: 'Observability Cloud receives the telemetry in the case study.' },
      { products: ['secure-firewall'], role: 'recommended', why: 'Boundary firewall. The case study racked one but did not configure it, and the rack-scale overview names it.' },
      { products: ['hybrid-mesh-fw'], role: 'recommended', why: 'Enforcement on BlueField DPUs, whose status conflicts between Cisco pages: available in March 2026, in development on 21 October 2026.' },
      { products: ['xdr'], role: 'recommended', why: 'The response layer. No Secure AI Factory page names XDR; it is an editorial addition.' },
      { products: ['intersight'], role: 'recommended', why: 'Fleet management for the compute, named on the Secure AI Factory page but not required by either document.' },
    ],
  },
];

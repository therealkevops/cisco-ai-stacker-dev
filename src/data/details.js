// What each product and primitive is for, and its most useful features.
//
// Product entries are taken from the vendor's own documentation, linked in `refs`. Where sources
// disagree, or a feature is early access or on a roadmap, the entry says so in `caveat` rather than
// stating it as fact. Features are what the vendor states, not independent measurements.
//
// Primitive entries are different: they are background explanation, not vendor claims, and the panel
// labels them that way.

const f = (name, text) => ({ name, text });

export const PRODUCT_DETAILS = {
  // ---- Network fabric ----
  n9364e: {
    about:
      'A 2RU fixed switch with 64 ports of 800G, built on Cisco Silicon One, for the back-end GPU fabric and the front-end network of an AI cluster. It runs NX-OS and is managed through Nexus Dashboard.',
    features: [
      f('64 ports of 800G in 2RU', 'QSFP-DD or OSFP, with breakout to 2 × 400G or 8 × 100G and support for 400, 200 and 100G ports.'),
      f('Lossless RoCE transport', 'Priority Flow Control, ECN marking, WRED, and DCBX with Enhanced Transmission Selection keep RDMA traffic from dropping frames.'),
      f('Dynamic Load Balancing', 'Spreads traffic across equal-cost paths instead of relying only on fixed hashing, so a few large flows do not pile onto one link.'),
      f('Shared buffer and telemetry', 'A 256 MB fully shared on-die packet buffer that treats mice and elephant flows differently, with model-driven telemetry and Nexus Dashboard Insights.'),
      f('Automation', 'Power On Auto Provisioning for day-0 setup, with Ansible, RESTCONF, NETCONF and gNMI using YANG and OpenConfig models.'),
    ],
    caveat: 'Cisco names the ASIC only as "Silicon One", and sources disagree on whether it is the G200. A newer 9364E-SG2X variant has different specifications, so check which model you mean.',
    refs: [['Nexus 9364E-SG2 data sheet', 'https://www.cisco.com/c/en/us/products/collateral/switches/nexus-9000-series-switches/nexus-9364e-sg2-switch-ds.html']],
  },
  'nexus-9000': {
    about:
      'Cisco\'s data center switching family, and the networking base of the AI PODs. In NX-OS mode the switches carry RoCE natively and add congestion management and load balancing tuned for AI traffic.',
    features: [
      f('RoCE v1 and v2, natively', 'Nexus 9000 switches in NX-OS mode carry RDMA over Converged Ethernet without extra gateways.'),
      f('PFC and ECN congestion avoidance', 'ECN marking through WRED or Approximate Fair Drop, with Priority Flow Control as the backstop, is the usual way to make RoCEv2 lossless.'),
      f('Intelligent Packet Flow', 'Dynamic Load Balancing, weighted cost multipath, per-packet load balancing and policy-based balancing, with hardware telemetry and fault-aware recovery.'),
      f('One family for both networks', 'Cisco positions the N9000 for the front-end and the back-end networks of an AI cluster.'),
    ],
    caveat: 'Features vary by platform and NX-OS release, and some load-balancing features are tied to NX-OS 10.6.1F. Check the platform and release you plan to use.',
    refs: [
      ['Data center networking blueprint for AI/ML', 'https://www.cisco.com/c/en/us/td/docs/dcn/whitepapers/cisco-data-center-networking-blueprint-for-ai-ml-applications.html'],
      ['The case for N9000 in front-end and back-end networks', 'https://blogs.cisco.com/datacenter/making-the-case-for-cisco-n9000-for-front-end-back-end-networks/'],
    ],
  },
  hyperfabric: {
    about:
      'A cloud-managed AI infrastructure offering: a cloud controller handles design, ordering, deployment, validation and monitoring of an on-premises cluster. It comes as a full-stack option or a bring-your-own option.',
    features: [
      f('Full-stack option', 'A turnkey cluster of UCS C885A servers with NVIDIA HGX H200 GPUs and BlueField-3 DPUs, following the NVIDIA Enterprise Reference Architecture, with optional VAST Data storage.'),
      f('Bring your own', 'Attach your own servers, GPUs and storage to the Hyperfabric network.'),
      f('Lifecycle from the cloud', 'Design, ordering, deployment, validation and monitoring from one cloud controller, with zero-touch provisioning.'),
      f('Cluster templates', 'Preconfigured designs for small to extra-large AI clusters.'),
      f('Lossless 800G fabric', 'Built on Cisco Silicon One and NVIDIA Spectrum-X Ethernet, with 800G optics.'),
    ],
    caveat: 'Cisco documents of different dates name different server and GPU generations; one blog refers to newer UCS 880 systems with B300 GPUs.',
    refs: [
      ['Hyperfabric AI data sheet', 'https://www.cisco.com/c/en/us/products/collateral/data-center-networking/nexus-hyperfabric/nexus-hyperfabric-ai-ds.html'],
      ['Hyperfabric Enterprise Reference Architecture', 'https://www.cisco.com/c/en/us/products/collateral/data-center-networking/nexus-hyperfabric/hyperfabric-ai-era-ds.html'],
    ],
  },
  'nexus-dashboard': {
    about:
      'The operations console for Nexus fabrics, bringing fabric automation, telemetry and analytics, and multi-site orchestration into one place. For AI clusters it adds congestion and job-level visibility.',
    features: [
      f('One place for the fabrics', 'Insights, Orchestrator and Fabric Controller are integrated as services across data center fabrics.'),
      f('RoCEv2 congestion visibility', 'Tracks ECN and PFC counters over time and surfaces microbursts and congestion hot spots.'),
      f('Congestion scoring', 'A Cisco Live deck describes PFC pattern analysis and a congestion score that rolls up from interface to switch to fabric.'),
      f('AI job monitoring', 'Release 4.2 added Slurm-based job monitoring, to correlate what a job does with how the network performs.'),
      f('Day-0 provisioning', 'An AI/ML QoS template and Fabric Controller automate setting up the fabric.'),
    ],
    caveat: 'Features are release-specific and the branding of the Insights, Orchestrator and Controller services has changed. Check which application delivers a feature in the release you plan to deploy.',
    refs: [
      ['Nexus Dashboard Insights data sheet', 'https://www.cisco.com/c/en/us/products/collateral/data-center-analytics/nexus-insights/datasheet-c78-742685.html'],
      ['Nexus Dashboard data sheet', 'https://www.cisco.com/c/en/us/products/collateral/data-center-analytics/nexus-dashboard/datasheet-c78-744371.html'],
    ],
  },
  'ucs-fi': {
    about:
      'The network edge of a UCS X-Series domain. Servers connect through the fabric interconnects, which run in Intersight Managed Mode so the whole domain is managed from Intersight. The RAG designs use the UCS 6536 (FlashStack) and the UCS S9108 (FlexPod).',
    features: [
      f('Intersight Managed Mode', 'Full manageability of everything behind the interconnects through Cisco Intersight.'),
      f('UCS 6536 ports and capacity', '10, 25, 40 and 100GbE ports in a cut-through design rated at 7.42 Tbps per interconnect.'),
      f('Chassis bandwidth', 'With X9108-IFM-100G modules, 1600 Gbps per X9508 chassis.'),
      f('Perpetual licence', 'From release 4.2(3) the UCS 6536 supports a perpetual software licence that activates all ports and features.'),
    ],
    caveat: 'No data sheet for the UCS S9108 was found, so its port count and capacity are not stated here.',
    refs: [
      ['UCS 6536 Fabric Interconnect data sheet', 'https://www.cisco.com/c/en/us/products/collateral/servers-unified-computing/ucs6536-fabric-interconnect-ds.html'],
      ['About Intersight Managed Mode', 'https://www.cisco.com/c/en/us/td/docs/unified_computing/Intersight/b_Intersight_Managed_Mode_Configuration_Guide/m_review_about_imm.html'],
    ],
  },
  'silicon-one': {
    about:
      'Cisco\'s own switch silicon family. The G200 is a 51.2 Tbps programmable chip aimed at spine, leaf and AI/ML fabrics. The Nexus 9364E-SG2 and the Hyperfabric 800G fabric are both built on Silicon One technology.',
    features: [
      f('51.2 Tbps in one chip', 'Described as a 5 nm, full-duplex, standalone switching processor for fixed-form-factor spine, leaf and AI/ML use.'),
      f('Programmable', 'P4-programmable forwarding with its own operating system and an SDK, so behaviour can change without new silicon.'),
      f('AI/ML load balancing', 'Congestion-aware packet spraying, congestion-aware stateful load balancing and hardware link-failure redistribution.'),
      f('Shared buffer', 'A fully shared packet buffer, and non-correlated weighted ECMP to avoid hash polarisation.'),
    ],
    caveat: 'Whether the Nexus 9364E-SG2 uses the G200 is unconfirmed, because Cisco describes it only as "based on Silicon One". The G200\'s role in a fully scheduled fabric is also unconfirmed.',
    refs: [
      ['Silicon One G200 data sheet', 'https://cisco.com/c/en/us/solutions/collateral/silicon-one/silicon-one-g200-ds.html'],
      ['Silicon One product family white paper', 'https://cisco.com/c/en/us/solutions/collateral/silicon-one/silicon-one-wp.html'],
    ],
  },
  'spectrum-x': {
    about:
      'NVIDIA\'s Ethernet platform for AI: Spectrum switches and BlueField SuperNICs working together to keep large AI jobs from slowing each other down. Cisco switches built on Silicon One take part in it.',
    features: [
      f('Adaptive routing', 'The switch sends each packet towards the least-congested port, and the SuperNIC puts packets back in order, so the application never sees the reordering.'),
      f('Congestion control', 'Senders adjust their rate from precise round-trip probes plus ECN marks, which the switch only adds once adaptive routing is exhausted.'),
      f('Performance isolation', 'Aimed at multi-tenant, multi-job environments, so one job does not degrade another.'),
      f('NVIDIA Enterprise Reference Architecture', 'The AI POD 2-8-9-400 design is compliant with it, and Hyperfabric\'s full-stack option follows it.'),
    ],
    caveat: 'NVIDIA states a 1.6× improvement over traditional Ethernet for generative AI traffic; that is a vendor figure, not an independent benchmark.',
    refs: [
      ['Optimize large-scale AI workloads with Spectrum-X', 'https://developer.nvidia.com/blog/optimize-large-scale-ai-workloads-with-nvidia-spectrum-x/'],
      ['Cisco AI POD for the NVIDIA 2-8-9-400 ERA', 'https://www.cisco.com/c/en/us/products/collateral/servers-unified-computing/ai-pod-ucs-c885a-servers-nexus-9364e-sg2-switches.html'],
    ],
  },

  // ---- Compute and accelerators ----
  c885a: {
    about:
      'Cisco\'s densest GPU server: an eight-GPU HGX system for large-model training, fine-tuning, inference and RAG, with one NIC per GPU for scale-out networking. It is the compute node of the AI POD 2-8-9-400 design.',
    features: [
      f('Eight-GPU HGX platform', 'NVIDIA HGX H100 or H200; AMD MI300X and MI350X variants are also listed.'),
      f('A NIC for every GPU', 'One NVIDIA ConnectX-7, BlueField-3 B3140H SuperNIC or AMD Pollara NIC per GPU for the back-end fabric.'),
      f('Two AMD EPYC CPUs, large memory', 'Up to 3 TB of memory and 30 TB of local NVMe, per the AI POD guide.'),
      f('Managed through Intersight', 'Starts with local management and Intersight inventory through a device connector, with fuller management in a later phase.'),
    ],
    caveat: 'Cisco documents of different dates list different GPU options, so confirm the configuration against the current data sheet.',
    refs: [
      ['UCS C885A M8 data sheet', 'https://www.cisco.com/c/en/us/products/collateral/servers-unified-computing/ucs-c-series-rack-servers/ucs-c885a-m8-ds.html'],
      ['AI POD for the NVIDIA 2-8-9-400 ERA', 'https://www.cisco.com/c/en/us/products/collateral/servers-unified-computing/ai-pod-ucs-c885a-servers-nexus-9364e-sg2-switches.html'],
    ],
  },
  c845a: {
    about:
      'An MGX-based 4RU server that takes two to eight PCIe GPUs, so GPU count can grow with the workload. It targets fine-tuning, RAG and inference, and is part of the AI PODs and of the VAST data platform.',
    features: [
      f('MGX design, 2 to 8 PCIe GPUs', 'NVIDIA RTX PRO 4500 and 6000 Blackwell Server Edition on newer pages; the 2025 data sheet lists H100 NVL, H200 NVL or L40S.'),
      f('Dual 5th Gen AMD EPYC, 4RU', 'Five PCIe x16 full-height, half-length slots alongside the eight GPU slots.'),
      f('400G scale-out', 'Four single-port 400G NVIDIA ConnectX-7 or BlueField-3 adapters.'),
      f('The compute node in VAST', 'As the CNode-X in the VAST AI OS design: eight RTX PRO 6000 GPUs (96 GB each) and up to 4 TB of DDR5.'),
      f('Managed through Intersight', 'Positioned for generative AI fine-tuning, RAG and inference as part of Cisco AI PODs.'),
    ],
    caveat: 'The GPU options differ between the 2025 PDF data sheet and Cisco\'s newer web pages, so check the current one.',
    refs: [
      ['UCS C845A M8 data sheet', 'https://www.cisco.com/c/en/us/products/collateral/servers-unified-computing/ucs-c-series-rack-servers/ucs-c845a-m8-rack-server-ds.html'],
      ['VAST Data on Cisco UCS data sheet', 'https://www.cisco.com/c/en/us/solutions/collateral/artificial-intelligence/vast-data-ucs-ds.html'],
    ],
  },
  'ucs-x': {
    about:
      'Cisco\'s modular compute system: an X9508 chassis holding X210c compute nodes and X440p PCIe nodes that add GPUs through X-Fabric. It is the base of the FlexPod and FlashStack RAG designs.',
    features: [
      f('GPUs through X440p PCIe nodes', 'Adds up to four GPUs to an X210c M6, X210c M7 or X410c M7 compute node, over X-Fabric.'),
      f('No midplane', 'Compute nodes and X-Fabric modules connect directly, so new nodes and fabric generations can be adopted without a forklift upgrade.'),
      f('Run from Intersight', 'Managed in Intersight Managed Mode, with an Intersight Essentials licence or higher per server.'),
      f('Both X-Fabric modules needed for GPUs', 'The X440p needs both UCS 9416 X-Fabric modules for its PCIe connectivity.'),
    ],
    caveat: 'The supported GPU list differs between data sheets and generations; check Cisco\'s current ordering guide.',
    refs: [['UCS X440p PCIe node data sheet', 'https://www.cisco.com/c/en/us/products/collateral/servers-unified-computing/ucs-x-series-modular-system/ucs-x440p-pcle-node-ds.html']],
  },
  intersight: {
    about:
      'Cisco\'s SaaS operations platform for UCS. It manages servers and fabric interconnects with policies and profiles, and, through Intersight Assist, other infrastructure too. It is the management plane of the AI PODs and of the FlexPod and FlashStack designs.',
    features: [
      f('Intersight Managed Mode', 'A Redfish-based model that manages standalone and fabric-interconnect-attached servers, standardising policy and operations across them.'),
      f('Spans server generations', 'The guide lists M8 servers alongside M6 and M7, so one policy approach covers a mixed estate.'),
      f('Intersight Assist', 'A virtual appliance that connects other infrastructure, such as Pure FlashArray and Nexus switches in the FlashStack design, to Intersight.'),
      f('Infrastructure analytics', 'The FlashStack RAG guide names Intersight analytics as part of its monitoring.'),
      f('Policies as code', 'The cisco.intersight Ansible collection manages Intersight policies from automation.'),
    ],
    caveat: 'Which features you get depends on the Intersight licence tier. Check the tier for what you need.',
    refs: [
      ['About Intersight Managed Mode', 'https://www.cisco.com/c/en/us/td/docs/unified_computing/Intersight/b_Intersight_Managed_Mode_Configuration_Guide/m_review_about_imm.html'],
      ['FlashStack RAG Cisco Validated Design', 'https://www.cisco.com/c/en/us/td/docs/unified_computing/ucs/UCS_CVDs/flashstack_rag_nim.html'],
    ],
  },
  'nvidia-gpu': {
    about:
      'The accelerators everything else exists to feed. In Cisco\'s portfolio they come as eight-GPU HGX baseboards in the C885A, as PCIe cards such as the L40S in X-Series GPU nodes, and as RTX PRO or H200 NVL cards in the C845A.',
    features: [
      f('HGX for large models', 'Eight-GPU baseboards in the C885A, built for large-model training, fine-tuning and inference.'),
      f('L40S for inference', '48 GB of GDDR6 with ECC at 864 GB/s on PCIe Gen4, passively cooled at up to 350 W.'),
      f('Transformer Engine', 'On the L40S, switches between FP8 and FP16 precision automatically to speed up transformer training and inference.'),
      f('vGPU support', 'The L40S supports NVIDIA vGPU profiles.'),
    ],
    caveat: 'The L40S does not support MIG or NVLink, per NVIDIA, so it suits models that fit on one card. NVIDIA claims up to 5× the inference performance of the A40, which is a vendor figure.',
    refs: [['NVIDIA L40S', 'https://www.nvidia.com/en-us/data-center/l40s/'], ['UCS X440p PCIe node data sheet', 'https://www.cisco.com/c/en/us/products/collateral/servers-unified-computing/ucs-x-series-modular-system/ucs-x440p-pcle-node-ds.html']],
  },
  bluefield: {
    about:
      'NVIDIA\'s data processing unit. It takes networking, storage and security work off the host CPU, and acts as the network adapter on Cisco\'s GPU servers. It is also where the Hybrid Mesh Firewall can enforce policy.',
    features: [
      f('400 Gb/s infrastructure platform', 'BlueField-3 is described as a 400 Gb/s infrastructure compute platform.'),
      f('Offloads the host', 'Line-rate software-defined networking, storage and cybersecurity, so these services do not use host CPU.'),
      f('Storage acceleration', 'RDMA, NVMe-oF and GPUDirect Storage, for block, file and object.'),
      f('Hardware-isolated security domain', 'NVIDIA describes a host-independent domain that enforces zero-trust controls outside the software it protects.'),
      f('DOCA', 'The software platform with SDKs, libraries and microservices for programming the DPU.'),
    ],
    refs: [['NVIDIA data processing units', 'https://www.nvidia.com/en-us/networking/products/data-processing-unit/']],
  },

  // ---- Platform and runtime ----
  'nvidia-ai-enterprise': {
    about:
      'NVIDIA\'s supported software suite for running AI in production. It brings NIM inference microservices, NeMo tools and blueprint workflows, with enterprise support. Both Cisco RAG designs build on it.',
    features: [
      f('NIM microservices', 'Ready-to-deploy inference microservices; the RAG designs use them for the language model, text embedding and reranking.'),
      f('NIM Operator', 'Manages the lifecycle of NIM microservices on Kubernetes, and part of AI Enterprise with enterprise support and security patching.'),
      f('NeMo', 'Microservices, model training, evaluation and guardrailing tools.'),
      f('Blueprints', 'Sample workflows for inference and model optimisation, such as the AI Blueprint for RAG used in the FlashStack design.'),
      f('Enterprise support', 'Extended-lifetime production branches, a secure software supply chain and vulnerability mitigation.'),
    ],
    caveat: 'Which components fall inside the AI Enterprise licence (for example NeMo Retriever and the blueprints) was not confirmed. Check NVIDIA\'s licensing documents.',
    refs: [['NVIDIA AI Enterprise', 'https://www.nvidia.com/en-us/data-center/products/ai-enterprise/'], ['NIM Operator 2.0', 'https://developer.nvidia.com/blog/nvidia-nim-operator-2-0-boosts-ai-deployment-with-nvidia-nemo-microservices-support']],
  },
  openshift: {
    about:
      'Red Hat\'s Kubernetes platform. The two RAG designs run OpenShift on bare metal, and OpenShift AI adds the tooling to build, train and serve models on it.',
    features: [
      f('Bare-metal OpenShift', 'The FlexPod design uses release 4.16 and the FlashStack design 4.17, both on bare metal.'),
      f('GPU acceleration', 'OpenShift AI works with NVIDIA and AMD GPUs and Intel accelerators, on premises or in the cloud, with self-service GPU access.'),
      f('Model serving', 'Deploy and serve models on GPUs, with vLLM among the supported serving runtimes.'),
      f('Distributed training and pipelines', 'Distributed workloads with GPU-aware scaling and monitoring, and AI pipelines.'),
      f('Model registry', 'Register models and versions, capture metadata, and promote approved versions to serving.'),
    ],
    refs: [['Red Hat OpenShift AI brief', 'https://www.redhat.com/en/resources/openshift-data-science-brief'], ['FlexPod RAG Cisco Validated Design', 'https://www.cisco.com/c/en/us/td/docs/unified_computing/ucs/UCS_CVDs/flexpod_rag_nim.html']],
  },
  kubernetes: {
    about:
      'The open-source container orchestrator that schedules AI workloads onto GPUs. Cisco\'s designs support upstream Kubernetes as well as OpenShift and Nutanix NKP.',
    features: [
      f('GPUs through device plugins', 'A vendor\'s device plugin exposes GPUs as a schedulable resource such as nvidia.com/gpu; support for AMD and NVIDIA GPUs has been stable since v1.26.'),
      f('Requested like CPU and memory', 'A container asks for whole GPUs in its resource limits, the same way it asks for CPU.'),
      f('Place workloads on the right GPU', 'Node labels and selectors, or Node Feature Discovery, steer pods to nodes with a particular type of GPU.'),
      f('Vendor drivers required', 'The administrator installs the GPU vendor\'s drivers and device plugin on each node.'),
    ],
    refs: [['Schedule GPUs, Kubernetes documentation', 'https://kubernetes.io/docs/tasks/manage-gpus/scheduling-gpus/']],
  },
  isovalent: {
    about:
      'The enterprise distribution of Cilium, Hubble and Tetragon from Isovalent, now part of Cisco: networking, security and observability for Kubernetes clusters, built on eBPF.',
    features: [
      f('Cilium networking and policy', 'Network policy that is DNS-aware and layer-7 aware, with deny rules, for micro-segmentation.'),
      f('Hubble observability', 'Visibility at layers 3, 4 and 7 across nodes, clusters and multi-cluster setups, with automatic service-dependency maps.'),
      f('Enterprise additions', 'A policy editor driven by live traffic, OIDC-based RBAC, SIEM integrations such as Splunk and Elastic, and historical data for root-cause analysis.'),
      f('Tetragon for runtime security', 'Included in the enterprise distribution; see Isovalent Runtime Security.'),
    ],
    caveat: 'Isovalent\'s place in the Cisco AI designs is not confirmed against a public design guide, and the sources for these features are Isovalent\'s own and partner pages.',
    refs: [['Isovalent Enterprise for Cilium brief', 'https://isovalent.com/briefs/isovalent-cilium-enterprise/'], ['Hubble', 'https://isovalent.com/projects/hubble']],
  },

  // ---- Security ----
  'ai-defense': {
    about:
      'Cisco\'s security product for AI: it finds the AI assets in use, tests models and applications for weaknesses, and enforces guardrails on live traffic. In the Secure AI Factory it is integrated with NVIDIA AI.',
    features: [
      f('AI Cloud Visibility', 'Discovers AI assets, including unsanctioned models, and the connected data sources in public and virtual private clouds.'),
      f('Model and application validation', 'Automated algorithmic red teaming across 200+ security and safety subcategories, mapped to OWASP, NIST and MITRE, which can run in CI/CD pipelines.'),
      f('AI Runtime Protection', 'Guardrails on prompts and responses for prompt injection, denial of service and sensitive-data leaks, enforced inline with no code changes.'),
      f('Agent and MCP coverage', 'Extends runtime protection to MCP traffic, inspecting agent actions and tool calls for threats such as memory poisoning and tool misuse.'),
      f('AI supply-chain scanning', 'Continuously scans model files, repositories and MCP servers for vulnerabilities.'),
    ],
    caveat: 'The agent, MCP and supply-chain capabilities are newer additions; Cisco\'s documentation changes quickly, so check what is current.',
    refs: [['AI Defense data sheet', 'https://www.cisco.com/c/en/us/products/collateral/security/ai-defense/ai-defense-ds.html'], ['AI Defense solution overview', 'https://www.cisco.com/c/en/us/products/collateral/security/ai-defense/ai-defense-so.html']],
  },
  'hybrid-mesh-fw': {
    about:
      'Cisco\'s approach to firewalling everywhere: enforcement points in the network, on servers and in the cloud, managed together. In the Secure AI Factory it is paired with NVIDIA BlueField DPUs.',
    features: [
      f('Enforcement in the fabric', 'Hypershield embeds stateful layer-3 and layer-4 enforcement directly in the data center fabric on N9300 smart switches, with the Catalyst 9350 extending it to campus and branch.'),
      f('Secure Firewall', 'The established firewall line, with IPS, malware protection and encrypted-traffic inspection.'),
      f('Microsegmentation and cloud', 'Secure Workload handles application-level microsegmentation, and Multicloud Defense extends layer-7 firewalling to public clouds.'),
      f('One management layer', 'Security Cloud Control manages policy, visibility and logs across the enforcement points, with AI-assisted policy suggestions.'),
      f('On BlueField DPUs', 'The Secure AI Factory pairs it with NVIDIA BlueField DPUs so enforcement runs close to the workload.'),
    ],
    caveat: 'Cisco labels some Hypershield and N9300 enforcement work as early access, so availability varies by region and model. Verify before planning a deployment.',
    refs: [
      ['Hybrid Mesh Firewall', 'https://www.cisco.com/site/au/en/solutions/security/hybrid-mesh-firewall/index.html'],
      ['Hypershield at a glance', 'https://www.cisco.com/c/en/us/products/collateral/security/hypershield-aag.html'],
      ['Cisco Secure AI Factory with NVIDIA', 'https://www.cisco.com/site/us/en/solutions/artificial-intelligence/secure-ai-factory/index.html'],
    ],
  },
  'secure-firewall': {
    about:
      'Cisco\'s firewall line, the established enforcement point in the hybrid mesh. Threat Defense runs the Snort 3 inspection engine and is managed through Secure Firewall Management Center or Security Cloud Control.',
    features: [
      f('Snort 3 inspection', 'The default inspection engine, a re-architected IPS; Snort 2 is deprecated from version 7.7.'),
      f('Encrypted Visibility Engine', 'Identifies application traffic in TLS 1.3 and QUIC without decrypting it.'),
      f('Dynamic policy', 'Dynamic objects and the Dynamic Attributes Connector support policy where IP addresses are not fixed.'),
      f('Talos threat intelligence', 'Threat blocking driven by Cisco Talos, with Snort ML for zero-day detection.'),
      f('Unified event viewer', 'Streams events from sensors in real time for faster investigation.'),
    ],
    refs: [['Key features in Secure Firewall 7.x', 'https://community.cisco.com/t5/security-knowledge-base/key-features-in-cisco-secure-firewall-version-7-x/ta-p/4528095'], ['Hybrid Mesh Firewall', 'https://www.cisco.com/site/au/en/solutions/security/hybrid-mesh-firewall/index.html']],
  },
  'isovalent-runtime': {
    about:
      'Runtime security for Kubernetes, built on Tetragon. It watches and can block process, file and network activity from inside the kernel, with the Kubernetes context of the workload that caused it.',
    features: [
      f('Process, file and network visibility', 'Detects process execution, system call activity and network and file I/O.'),
      f('Kubernetes-aware', 'Understands namespaces and pods, so rules target individual workloads, and events carry the pod, container and command-line context.'),
      f('Enforcement in the kernel', 'Filtering, blocking and reacting happen in the kernel instead of in a user-space agent, which keeps observation overhead low.'),
      f('Policy as a Kubernetes resource', 'Policies are written as TracingPolicy custom resources.'),
      f('Open source core', 'Tetragon is part of the Cilium project, under the Apache 2.0 licence.'),
    ],
    refs: [['Tetragon overview', 'https://tetragon.cilium.io/docs/overview/'], ['Isovalent Tetragon', 'https://isovalent.com/tetragon']],
  },
  'splunk-es': {
    about:
      'Splunk\'s security operations platform for threat detection, investigation and response, now part of Cisco. It is the security analytics layer of the Secure AI Factory.',
    features: [
      f('Risk-based alerting', 'Rolls up many low-scoring findings into one higher-confidence finding; Splunk claims this can cut alert volume substantially.'),
      f('Detections aligned to MITRE', 'The Splunk Threat Research Team supplies out-of-the-box detections mapped to industry frameworks.'),
      f('Mission Control', 'Case management and triage that brings detections, findings and investigations into one workflow.'),
      f('SOAR playbooks', 'Integrates with Splunk SOAR for automated playbooks and actions.'),
      f('Threat intelligence and response plans', 'Normalised risk scores for threat intelligence, and response-plan templates that track each phase of an incident.'),
    ],
    refs: [['About Splunk Enterprise Security', 'https://help.splunk.com/en/splunk-enterprise-security-8/user-guide/8.0/introduction/about-splunk-enterprise-security'], ['Splunk Enterprise Security', 'https://splunk.com/en_us/software/enterprise-security.htm']],
  },
  xdr: {
    about:
      'Cisco\'s extended detection and response. It correlates telemetry from several sources into prioritised incidents mapped to attack techniques, with guided and automated response.',
    features: [
      f('Six native telemetry sources', 'Endpoint, network, firewall, email, identity and DNS.'),
      f('Correlates, not just aggregates', 'Groups related alerts using common indicators into incidents.'),
      f('Prioritised by risk', 'Ranks incidents by potential risk and impact, tied to MITRE ATT&CK techniques and the value of affected assets.'),
      f('Attack chains', 'Maps the whole attack to MITRE ATT&CK, using network telemetry in the correlation.'),
      f('Playbooks and guided response', 'Orchestration playbooks that can be triggered manually, by a rule, or by API, webhook or schedule, plus AI-guided recommended actions.'),
    ],
    caveat: 'Third-party telemetry integrations are not in the base Essentials tier; they come with Advantage and Premier. Some features, such as Instant Attack Verification, were in private preview when Cisco described them.',
    refs: [['Cisco XDR data sheet', 'https://www.cisco.com/c/en/us/products/collateral/security/xdr/xdr-ds.html'], ['Cisco XDR at a glance', 'https://www.cisco.com/c/en/us/products/collateral/security/securex/cisco-xdr-aag.html']],
  },
  'foundation-ai': {
    about:
      'Cisco\'s Foundation AI team builds open-weight models for security. Foundation-sec-8B is an 8-billion-parameter model that organisations can run on their own infrastructure.',
    features: [
      f('Built for security work', 'Pre-trained on a Cisco-built dataset of vulnerability databases, MITRE ATT&CK mappings, threat reports and compliance guidance, on top of Llama 3.1 8B.'),
      f('Open weights', 'Released under a permissive licence, so it can run on premises, air-gapped or in a secure cloud enclave.'),
      f('Targeted use cases', 'Threat detection, vulnerability assessment, security automation and attack simulation.'),
      f('Reasoning variant', 'Foundation-sec-8B-Reasoning adds multi-step reasoning for configuration analysis, adversary-behaviour mapping and access-privilege review.'),
      f('Used with Splunk', 'Splunk\'s integration uses it to summarise incidents and prioritise alerts.'),
    ],
    refs: [['Foundation-sec, Cisco\'s first open-source security model', 'https://blogs.cisco.com/security/foundation-sec-cisco-foundation-ai-first-open-source-security-model'], ['A virtual SOC analyst demo', 'https://www.sdxcentral.com/news/cisco-demos-practical-agentic-ai-for-soc-automation/']],
  },

  // ---- Operations and agents ----
  'splunk-obs': {
    about:
      'Splunk\'s observability platform, now part of Cisco. For AI it monitors the GPU and model-serving layer and, newly, the behaviour and cost of agents.',
    features: [
      f('AI Infrastructure Monitoring', 'Built-in dashboards for GPU utilisation and power, and for serving platforms including vLLM, NVIDIA NIM and NVIDIA Dynamo, and for Cisco AI PODs.'),
      f('Token economics', 'Reports time to first token and cost estimates, so performance and spend can be read together.'),
      f('AI Agent Monitoring', 'Traces each step of an agent workflow, tracks token cost by agent, and evaluates quality, safety and security.'),
      f('Agents down to the GPU', 'Splunk says agent workflows can be correlated with the infrastructure beneath them.'),
      f('OpenTelemetry-based', 'Telemetry is collected with the Splunk Distribution of the OpenTelemetry Collector.'),
    ],
    caveat: 'AI Agent Monitoring was listed as alpha at Splunk\'s .conf25, and the official page confirming its general availability was not found. Check its status before relying on it.',
    refs: [['AI agent and AI infrastructure monitoring', 'https://www.splunk.com/en_us/blog/observability/monitor-the-health-performance-and-security-of-your-ai-application-stack-with-ai-agent-and-ai-infrastructure-monitoring.html'], ['Agent observability', 'https://www.splunk.com/en_us/products/agent-observability.html']],
  },
  'ai-canvas': {
    about:
      'Cisco\'s generative workspace for IT operations, the centrepiece of its AgenticOps approach. Teams investigate and act together in one shared view that the AI builds around the incident.',
    features: [
      f('Generative UI', 'Generates charts, tables and timelines tailored to the incident under investigation, instead of a fixed dashboard.'),
      f('Cross-domain troubleshooting', 'Ask a question such as "why is the VPN slow?" and get correlations across domains.'),
      f('Shared workspace', 'NetOps, SecOps and application teams work in one workspace; a link shares it, and pinned evidence persists through handoffs.'),
      f('Draws on Cisco and Splunk telemetry', 'Cisco names Meraki, ThousandEyes and Splunk, and unifies signals across the stack through the Model Context Protocol.'),
      f('Humans approve', 'Agents investigate and propose; operators supervise and approve execution.'),
    ],
    caveat: 'Announced in June 2025. Availability and the current feature scope should be confirmed on Cisco\'s site.',
    refs: [['Announcing Cisco AI Canvas', 'https://newsroom.cisco.com/c/r/newsroom/en/us/a/y2025/m06/announcing-cisco-ai-canvas-revolutionizing-it-with-agenticops.html'], ['AI Canvas', 'https://www.cisco.com/site/us/en/solutions/artificial-intelligence/agentic-ops/ai-canvas/']],
  },
  thousandeyes: {
    about:
      'Cisco\'s digital experience and internet visibility platform. It measures the path from a user or site to a service across networks you do and do not own, and is one of the telemetry sources AI Canvas draws on.',
    features: [
      f('Path visualisation', 'Maps hop-by-hop paths from agents to service endpoints across MPLS WAN, internet and SD-WAN.'),
      f('Enterprise Agents', 'Software agents inside branches, data centers and cloud VPCs that probe network and application performance at regular intervals.'),
      f('Endpoint Agents', 'Browser-based agents on employee laptops for real-time end-user monitoring.'),
      f('Internet and cloud intelligence', 'Uses a large internet monitoring dataset to detect outages in near real time, and tracks BGP routing health.'),
      f('Alerts', 'Customisable alerts with defined thresholds.'),
    ],
    caveat: 'Several of these sources are older (the platform overview is from 2021). The ThousandEyes documentation site is the current reference.',
    refs: [['ThousandEyes platform overview', 'https://cisco.com/c/dam/m/en_in/pdf/thousandeyes-platform-overview.pdf'], ['Path visualisation', 'https://docs.thousandeyes.com:8443/product-documentation/internet-and-wan-monitoring/path-visualization']],
  },
  agntcy: {
    about:
      'An open project, started by Cisco\'s Outshift and now at the Linux Foundation, for the infrastructure agents need to find, trust and talk to each other: the Internet of Agents.',
    features: [
      f('Discovery', 'An agent directory built on the Open Agent Schema Framework, so agents can learn each other\'s capabilities.'),
      f('Identity', 'Cryptographically verifiable identity, for secure activity across organisational boundaries.'),
      f('Messaging', 'SLIM, a transport layer that extends gRPC with pub/sub, with secure group communication.'),
      f('Observability', 'SDKs that make agent activity transparent.'),
      f('Works with A2A and MCP', 'Makes A2A agents and MCP servers discoverable through AGNTCY directories.'),
    ],
    refs: [['AGNTCY documentation', 'https://docs.agntcy.org'], ['Linux Foundation welcomes AGNTCY', 'https://www.linuxfoundation.org/press/linux-foundation-welcomes-the-agntcy-project-to-standardize-open-multi-agent-system-infrastructure-and-break-down-ai-agent-silos']],
  },

  // ---- Data and storage ----
  netapp: {
    about:
      'The storage half of FlexPod, Cisco and NetApp\'s converged design. NetApp published a validated design for the Cisco AI POD, and the FlexPod RAG guide uses its all-flash arrays.',
    features: [
      f('FlexPod AI', 'Cisco compute and network with NetApp storage as one validated stack.'),
      f('All-flash ONTAP in the RAG design', 'An AFF C800 HA pair running ONTAP 9.14.1 in the FlexPod RAG guide.'),
      f('Kubernetes storage', 'NetApp Trident provisions persistent storage for the OpenShift cluster, and the DataOps Toolkit is part of the design.'),
      f('Global namespace for RAG', 'NetApp announced using ONTAP\'s global metadata namespace with NVIDIA AI software to power enterprise RAG.'),
      f('NVIDIA certification', 'ONTAP has DGX BasePOD certification, and NetApp has begun the certification of AFF A90 with DGX SuperPOD.'),
    ],
    caveat: 'NetApp\'s own product pages could not be read, so this rests on the Cisco guide and NetApp\'s 2024 announcement. Check NetApp for current features.',
    refs: [['FlexPod RAG Cisco Validated Design', 'https://www.cisco.com/c/en/us/td/docs/unified_computing/ucs/UCS_CVDs/flexpod_rag_nim.html'], ['NetApp AI announcement, September 2024', 'https://www.businesswire.com/news/home/20240924719882/en/NetApp-Powers-the-Future-of-AI-with-Intelligent-Data-Infrastructure'], ['NetApp validated design for the Cisco AI POD', 'https://www.netapp.com/media/164712-nva-1186-design-cisco-ai-pod.pdf']],
  },
  pure: {
    about:
      'The storage half of FlashStack, Cisco and Pure Storage\'s converged design. The FlashStack RAG guide uses FlashArray for block storage and FlashBlade for object storage, with Portworx for Kubernetes.',
    features: [
      f('FlashArray for persistent volumes', 'A FlashArray//XL170 acts as the Portworx cloud storage provider over iSCSI.'),
      f('FlashBlade for object', 'A FlashBlade//S200 provides an S3-compatible object store for the Milvus vector database.'),
      f('Portworx Enterprise', 'Container-native persistent storage for the OpenShift cluster.'),
      f('ActiveCluster and multi-tenancy', 'FlashArray supports synchronous replication and secure multi-tenancy with Portworx.'),
      f('Non-disruptive FlashBlade//S upgrades', 'Separates compute from capacity, and upgrades storage, compute and networking without downtime.'),
    ],
    caveat: 'Pure\'s own product pages could not be read, and one of the sources dates from 2023. Check Pure for current features.',
    refs: [['FlashStack RAG Cisco Validated Design', 'https://www.cisco.com/c/en/us/td/docs/unified_computing/ucs/UCS_CVDs/flashstack_rag_nim.html'], ['Portworx with Pure Storage', 'https://docs.portworx.com/portworx-enterprise/3.4/platform/pure-storage'], ['FlashBlade//S announcement', 'https://itwire.com/business-it-news/storage/pure-storage-unveils-flashblade-s-%E2%80%93-and-more']],
  },
  vast: {
    about:
      'An AI data platform that Cisco calls a core component of the Secure AI Factory. VAST AI OS combines storage, a database and an event engine on one disaggregated architecture, on Cisco UCS and Nexus.',
    features: [
      f('One platform for files, objects and tables', 'Multi-protocol access (NFS, SMB, S3, NVMe/TCP) with no data copies or storage tiering.'),
      f('Disaggregated architecture', 'Scales compute and flash independently, on UCS C845A GPU nodes and UCS C225 all-flash nodes.'),
      f('InsightEngine', 'Classifies content, extracts context and generates embeddings, which keeps RAG corpora current.'),
      f('DataStore, DataBase, DataEngine, AgentEngine', 'Storage, a catalog for metadata, vectors and tables, an event and function engine, and a runtime for agents.'),
      f('Ransomware resilience', 'Immutable snapshots and a ransomware-resilient architecture with rapid recovery.'),
    ],
    refs: [['VAST Data on Cisco UCS data sheet', 'https://www.cisco.com/c/en/us/solutions/collateral/artificial-intelligence/vast-data-ucs-ds.html'], ['VAST InsightEngine on AI PODs', 'https://www.cisco.com/c/en/us/solutions/collateral/artificial-intelligence/vast-insight-engine-ai-pods-aag.pdf']],
  },
  hitachi: {
    about:
      'A storage partner for the Secure AI Factory. Hitachi iQ pairs Hitachi\'s VSP One storage with NVIDIA accelerated computing as an AI infrastructure offering.',
    features: [
      f('Hitachi iQ M Series', 'VSP One storage, a choice of file systems and optional NVIDIA AI Enterprise software, as one AI infrastructure solution.'),
      f('Independent scaling', 'Compute and storage can be scaled separately, with an optional object storage repository.'),
      f('Tiering', 'Intelligent tiering between NVMe flash and object storage, per an analyst report.'),
      f('NVIDIA alignment', 'Integrates the NVIDIA AI Data Platform reference design and holds DGX BasePOD certification.'),
    ],
    caveat: 'No source was found confirming a Cisco-validated design with Hitachi iQ. Its place here comes from Cisco listing Hitachi Vantara as a Secure AI Factory storage partner.',
    refs: [['Hitachi iQ with VSP One', 'https://www.hitachivantara.com/en-us/news/gl250618'], ['Hitachi Vantara AI push', 'https://www.blocksandfiles.com/ai-ml/2025/05/27/hitachi-vantara-primes-partnership-driven-ai-push/1587170']],
  },
  nutanix: {
    about:
      'A storage and Kubernetes partner. Cisco and Nutanix describe AI PODs with Nutanix: Cisco UCS and Nexus with Nutanix Kubernetes Platform, Enterprise AI and Unified Storage.',
    features: [
      f('Nutanix Kubernetes Platform (NKP)', 'CNCF-certified, and one of the Kubernetes platforms the Secure AI Factory supports alongside OpenShift and upstream.'),
      f('Nutanix Unified Storage', 'Release 5.3 is available now, with multi-tenant object scaling for large AI data lakes, and enterprise-level NVIDIA-Certified Storage validation.'),
      f('Nutanix Enterprise AI', 'Handles AI model inference and management, per Cisco\'s collateral.'),
      f('Cisco AI PODs with Nutanix', 'Cisco UCS GPU-dense compute and Nexus AI networking with NKP and Nutanix Enterprise AI.'),
    ],
    caveat: 'Several Nutanix items are roadmap: NKP Metal (bare-metal Kubernetes) is in early access with general availability planned for the second half of 2026, and the agentic AI solution is in early access. Cisco\'s "AI PODs with Nutanix" sheet could not be opened, so its description rests on a search summary of it.',
    refs: [['Nutanix delivers a complete platform for the agentic AI era', 'https://www.hpcwire.com/off-the-wire/nutanix-delivers-complete-platform-for-the-agentic-ai-era/'], ['Cisco AI PODs with Nutanix at a glance', 'https://www.cisco.com/c/en/us/products/collateral/hyperconverged-infrastructure/compute-hyperconverged/ai-pods-with-nutanix-aag.pdf']],
  },
};

// Background for the primitives. This is explanation, not vendor claims.
export const PRIMITIVE_DETAILS = {
  compute: {
    why: 'GPUs do the arithmetic of training and inference, and the servers around them have to keep them fed. How much memory a GPU has decides which models fit on one card, and how the GPUs are linked decides how well a job can spread across many.',
    lookFor: [
      f('GPU memory per card', 'It sets the largest model one GPU can hold, and how much room is left for the working cache of a long conversation.'),
      f('How the GPUs connect', 'Eight-GPU baseboards with a fast GPU-to-GPU interconnect suit training; PCIe cards suit inference and smaller jobs.'),
      f('A network adapter per GPU', 'Scale-out jobs need each GPU to reach the back-end network at line rate.'),
      f('Fleet management', 'Firmware, drivers and policy at the scale of many servers matter as much as the first install.'),
    ],
  },
  network: {
    why: 'Distributed AI jobs move bursts of data between GPUs in lockstep, and a few very large flows can collide on one link. One dropped or delayed packet can stall a whole job, so these fabrics are built to be lossless and to spread traffic carefully. Cisco\'s designs keep a back-end network for GPU-to-GPU traffic apart from the front-end network for storage and users.',
    lookFor: [
      f('Lossless RoCE', 'Priority Flow Control and ECN keep RDMA traffic from dropping frames under load.'),
      f('Smarter load balancing', 'Moving beyond fixed hashing, such as dynamic or per-packet balancing, so large flows do not pile up.'),
      f('Congestion telemetry', 'Being able to see ECN, PFC and queue behaviour, and tie it to jobs.'),
      f('Speed and optics', 'Port speeds of 400G and 800G, and the optics to match, decide how many GPUs one switch can serve.'),
    ],
  },
  data: {
    why: 'Models read training data, write checkpoints, and retrieve documents at answer time, so storage has to deliver high throughput to many clients at once. For retrieval-augmented generation the data also has to stay fresh and searchable.',
    lookFor: [
      f('Throughput under parallel load', 'Many GPUs and processes read at once; the question is aggregate speed, not a single stream.'),
      f('File and object access', 'NFS for datasets and S3 for vector databases and pipelines.'),
      f('Kubernetes integration', 'A storage provisioner so persistent volumes appear on demand.'),
      f('Data protection', 'Snapshots and immutability, because the data behind a model is a target in its own right.'),
    ],
  },
  platform: {
    why: 'The platform is what turns a rack of GPUs into something teams can use: it schedules workloads onto GPUs, packages models as services, and keeps the software stack supported. Most of Cisco\'s designs run it on Kubernetes.',
    lookFor: [
      f('GPU scheduling', 'Device plugins, labels and affinity to put each workload on the right GPU.'),
      f('Supported inference services', 'Packaged, patched model-serving components, not hand-built ones.'),
      f('Cluster networking and policy', 'Network policy and visibility inside the cluster.'),
      f('Lifecycle and support', 'Who patches the stack, and for how long.'),
    ],
  },
  security: {
    why: 'AI adds new things to defend: prompts that can be manipulated, models and agents that can be tricked or abused, and a software supply chain of model files. The usual infrastructure threats do not go away, so security spans the model, the workload, the network and the security operations centre.',
    lookFor: [
      f('Validating models and apps', 'Testing for weaknesses before deployment.'),
      f('Runtime guardrails', 'Inspecting prompts, responses and agent actions on live traffic.'),
      f('Workload and network enforcement', 'Segmentation and runtime controls close to where the workload runs.'),
      f('Detection and response', 'A place where signals from all of the above are correlated and acted on.'),
    ],
  },
  ops: {
    why: 'Keeping an AI estate healthy means watching GPUs, models and the network together, and tying cost to usage. Operations is also where agents are arriving: software that acts on infrastructure, and that needs identity, discovery and a way to talk to other agents.',
    lookFor: [
      f('GPU and serving telemetry', 'Utilisation, power, latency and token cost, in one place.'),
      f('Agent and model tracing', 'Following a request through an agent workflow, using OpenTelemetry.'),
      f('Cross-domain correlation', 'Seeing a network, application and infrastructure problem as one incident.'),
      f('Open agent protocols', 'Standards such as MCP and A2A, and shared identity and discovery for agents.'),
    ],
  },
};

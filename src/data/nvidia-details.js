// Fuller descriptions for the NVIDIA lens, written from NVIDIA's own pages (the URLs in `refs`).
// Wording is a paraphrase. Figures are as NVIDIA states them, and several are NVIDIA's projections
// rather than measurements; where a page was unreadable, conflicting or about something announced,
// the `caveat` says so.

import { NV } from './nvidia-urls.js';

const f = (name, text) => ({ name, text });

export const NVIDIA_PRIMITIVE_SUMMARIES = {
  platform: { summary: 'The software that turns GPUs into a service: NVIDIA AI Enterprise and what it bundles, inference engines and microservices, GPU orchestration, and the Kubernetes platforms they run on.' },
  ops: { summary: 'Managing the AI factory: cluster and fabric management, GPU health, digital twins, and the toolkit and blueprints for building and observing agents.' },
  security: { summary: 'Protection that runs on the BlueField DPU outside the host, hardware-based confidential computing, guardrails for models and agents, and the partners and Cisco products NVIDIA names.' },
  network: { summary: 'NVIDIA\'s scale-up (NVLink) and scale-out (InfiniBand and Spectrum-X Ethernet) networks, the adapters and DPUs at the edge of the server, and the Cisco switches NVIDIA names.' },
  compute: { summary: 'NVIDIA\'s systems, from DGX, HGX and MGX servers to NVL72 racks, and the NVIDIA-Certified program through which partners such as Cisco build them.' },
  data: { summary: 'The storage and data layer of the AI factory: the AI Data Platform and Certified Storage programs, the data-movement software, and retrieval for RAG.' },
};

export const NVIDIA_PRIMITIVE_DETAILS = {
  compute: {
    why: 'GPUs do the arithmetic of training and inference, and the servers around them have to keep them fed. How much memory a GPU has decides which models fit on one card, and how the GPUs are linked decides how well a job can spread across many.',
    lookFor: [
      f('GPU memory per card', 'It sets the largest model one GPU can hold, and how much room is left for the working cache of a long conversation.'),
      f('How the GPUs connect', 'Eight-GPU baseboards and 72-GPU racks with a fast GPU-to-GPU interconnect suit training; PCIe cards suit inference and smaller jobs.'),
      f('A network adapter per GPU', 'Scale-out jobs need each GPU to reach the back-end network at line rate.'),
      f('Fleet management', 'Firmware, drivers and policy at the scale of many servers matter as much as the first install.'),
    ],
  },
  network: {
    why: 'Distributed AI jobs move bursts of data between GPUs in lockstep, and a few very large flows can collide on one link. One dropped or delayed packet can stall a whole job. There are two networks to think about: the scale-up network inside a rack, and the scale-out fabric between racks.',
    lookFor: [
      f('Scale-up bandwidth', 'How much bandwidth each GPU has to every other GPU in its rack or server.'),
      f('Lossless transport', 'RDMA over InfiniBand or tuned Ethernet, with congestion control that keeps frames from dropping under load.'),
      f('Smarter load balancing', 'Moving beyond fixed hashing, so large flows do not pile up on one path.'),
      f('Visibility', 'Being able to see congestion and tie it to jobs.'),
    ],
  },
  data: {
    why: 'Models read training data, write checkpoints, and retrieve documents at answer time, so storage has to deliver high throughput to many clients at once. For retrieval-augmented generation the data also has to stay fresh and searchable.',
    lookFor: [
      f('Throughput under parallel load', 'Many GPUs and processes read at once; the question is aggregate speed, not a single stream.'),
      f('A direct path to the GPU', 'Whether data can reach GPU memory without a detour through the host CPU.'),
      f('Retrieval built in', 'Embedding, indexing and vector search close to the data, for RAG and agents.'),
      f('Certification', 'Whether the storage has been tested against the reference architecture you are building.'),
    ],
  },
  platform: {
    why: 'The platform is what turns a rack of GPUs into something teams can use: it schedules workloads onto GPUs, packages models as services, and keeps the software stack supported. NVIDIA\'s AI software runs on Kubernetes, from several vendors, with its own operators managing the GPU software.',
    lookFor: [
      f('GPU scheduling', 'Sharing and prioritising GPUs between teams, not just handing out whole cards.'),
      f('Supported inference services', 'Packaged, patched model-serving components, not hand-built ones.'),
      f('A platform your team can run', 'Which Kubernetes or hypervisor the software is supported on, and who patches it.'),
      f('Lifecycle and support', 'How long a release is supported, and what the support covers.'),
    ],
  },
  security: {
    why: 'AI adds new things to defend: prompts that can be manipulated, models and agents that can be tricked or abused, and a software supply chain of model files. Controls that share a host with the workload share its fate, so some are built to run outside it.',
    lookFor: [
      f('Enforcement outside the host', 'Whether the control still works if the host operating system is compromised.'),
      f('Runtime guardrails', 'Inspecting prompts, responses and agent actions on live traffic.'),
      f('Protection of data in use', 'Hardware isolation for models and data while they are being processed.'),
      f('Detection and response', 'A place where signals from all of the above are correlated and acted on.'),
    ],
  },
  ops: {
    why: 'Keeping an AI estate healthy means watching GPUs, the fabric and the workloads together, and recovering quickly when hardware fails. Operations is also where agents are arriving: software that acts on infrastructure, and that needs to be built, evaluated and observed.',
    lookFor: [
      f('Automatic recovery', 'Detecting a failed node or link and getting the job running again without a manual runbook.'),
      f('GPU and fabric telemetry', 'Health, power and congestion in one place, across compute and network.'),
      f('Simulation before change', 'A digital twin to test a design or a change before it reaches the real estate.'),
      f('Agent observability', 'Following a request through an agent workflow, using open standards such as OpenTelemetry.'),
    ],
  },
};

const d = (about, features, refs, caveat) => ({ about, features, refs, ...(caveat ? { caveat } : {}) });

export const NVIDIA_DETAILS = {
  // Compute
  dgx: d(
    'Eight-GPU enterprise AI systems: the DGX B300 on Blackwell Ultra GPUs and the DGX B200 on Blackwell. NVIDIA describes the B200 as the foundation for DGX BasePOD and SuperPOD, and ships both with DGX OS.',
    [
      f('Eight GPUs per system', 'Eight Blackwell Ultra (B300, 2.1 TB of GPU memory) or Blackwell (B200, 1,440 GB) GPUs, joined by fifth-generation NVLink at 14.4 TB/s.'),
      f('Networking in the box', 'The B300 carries eight ConnectX-8 adapters (up to 800 Gb/s) and two BlueField-3; the B200 carries eight ConnectX-7 and two BlueField-3.'),
      f('Rack and power options', 'The B300 is 10U, offers AC and DC power, and works in MGX racks or traditional enterprise racks.'),
      f('Software recommended with it', 'NVIDIA AI Enterprise and Mission Control are recommended, with three-year business-standard support.'),
    ],
    [['DGX B300', NV.dgxB300], ['DGX B200', NV.dgxB200]],
    'NVIDIA\'s main DGX platform page did not list the B200 and B300 when read, although each has its own page. DGX B300 is marked Available Now; the B200 page states no availability.',
  ),
  hgx: d(
    'The eight-GPU baseboard platform that server makers build systems around. It integrates the GPUs, NVLink and networking options, so the same platform appears in servers from many vendors, including Cisco\'s UCS C885A.',
    [
      f('Configurations', 'HGX Rubin NVL8 (eight Rubin GPUs, 2 TB of HBM4), HGX B300 (2.1 TB) and HGX B200 (1.4 TB).'),
      f('Scale-up and scale-out', 'NVLink inside the baseboard; InfiniBand and Spectrum-X Ethernet to scale out; Spectrum-XGS to join data centers.'),
      f('BlueField for infrastructure', 'BlueField DPUs handle infrastructure services such as networking and security.'),
      f('Choice of CPU', 'HGX Rubin NVL8 can pair with the Vera CPU or an x86 baseboard.'),
    ],
    [['NVIDIA HGX', NV.hgx]],
    'HGX B300 and B200 are shipping per NVIDIA. HGX Rubin NVL8 is described as ramping into full production, and its 10x throughput claim over HGX B200 is an NVIDIA projection.',
  ),
  mgx: d(
    'An open, modular reference architecture that lets server makers build accelerated servers from a single node up to a rack-scale AI factory, aimed at cutting engineering cost and staying compatible across hardware generations.',
    [
      f('Third-generation MGX rack', 'Combines compute and networking servers, cooling, power and connectors in one design.'),
      f('Mix of parts', 'GPU options include Blackwell and Rubin; CPU options include Grace, Vera, x86 and other Arm; networking options include NVLink, Spectrum-X, Quantum InfiniBand and BlueField.'),
      f('Over 100 combinations', 'NVIDIA says the modular designs allow more than 100 combinations, and are based on the Open Compute Project.'),
      f('Storage racks too', 'Lists STX AI-native storage racks, including CMX context-memory storage, alongside the compute racks.'),
    ],
    [['NVIDIA MGX', NV.mgx]],
    'The partner list on the page was empty when read. The LPX and STX racks are very new and their shipping status was not checked.',
  ),
  'gb300-nvl72': d(
    'A liquid-cooled rack that joins 72 Blackwell Ultra GPUs and 36 Grace CPUs in one NVLink domain, positioned for AI reasoning. The GB200 NVL72 is the previous generation with the same layout.',
    [
      f('One NVLink domain', '72 Blackwell Ultra GPUs and 36 Grace CPUs, with 130 TB/s of NVLink bandwidth and 37 TB of fast memory.'),
      f('Network per GPU', 'ConnectX-8 SuperNICs at 800 Gb/s per GPU, paired with Quantum-X800 InfiniBand or Spectrum-X Ethernet.'),
      f('Managed by Mission Control', 'NVIDIA Mission Control handles orchestration and resilience for the rack.'),
      f('Tensor core gains', 'Blackwell Ultra tensor cores give 2x attention acceleration and 1.5x dense FP4 over Blackwell, per NVIDIA.'),
    ],
    [['GB300 NVL72', NV.gb300], ['GB200 NVL72', 'https://www.nvidia.com/en-us/data-center/gb200-nvl72/']],
    'The page marks it Available Now, through NVIDIA sales. The FP4 figure on the page was garbled, so it is not quoted here, and the "up to 50x" output claim over Hopper is an NVIDIA projection.',
  ),
  'vera-rubin-nvl72': d(
    'The third-generation MGX rack-scale system, called the Rack-Scale Agentic AI Supercomputer: 72 Rubin GPUs and 36 Vera CPUs, with ConnectX-9 SuperNICs and BlueField-4 DPUs.',
    [
      f('NVLink 6', 'A 216 TB/s NVLink switch joins the 72 GPUs, with 20.7 TB of HBM4 across the rack.'),
      f('Networking', 'ConnectX-9 SuperNICs and BlueField-4 DPUs; scale-out over Quantum-X800 InfiniBand or Spectrum-X Ethernet.'),
      f('Modular tray design', 'Cable-free trays, with NVIDIA citing over 80 MGX ecosystem partners.'),
      f('Confidential computing', 'NVIDIA Confidential Computing extends across all 72 GPUs and 36 CPUs as one security domain.'),
    ],
    [['Vera Rubin NVL72', NV.rubin], ['Confidential Computing', NV.confidential]],
    'The page says Available Now but also that Vera Rubin is ramping into full production, so treat it as ramping. Cost-per-token and tokens-per-megawatt figures are NVIDIA projections.',
  ),
  'rtx-pro-servers': d(
    'Enterprise servers built on the RTX PRO 6000 Blackwell Server Edition GPU for AI and visual computing, which NVIDIA calls a new category of enterprise data center infrastructure. They are the basis of the RTX PRO AI Factory reference architecture.',
    [
      f('The GPU', '96 GB of GDDR7 with ECC, PCIe Gen 5, up to 600 W, and multi-instance GPU up to four instances.'),
      f('Two cooling options', 'Air-cooled dual-slot and liquid-cooled single-slot versions; a 6U MGX design hosts the liquid-cooled one.'),
      f('Aimed at', 'Agentic and physical AI, scientific computing, rendering and video, as well as inference.'),
      f('Reference architecture', 'Forms the 2-8-5-200 RTX PRO AI Factory, with BlueField-3 networking and Spectrum-4 switches.'),
    ],
    [['RTX PRO 6000 Blackwell Server Edition', NV.rtxPro], ['RTX PRO AI Factory components', NV.eraRtxPro]],
    'The page says available now but also carries a notify-me form, so availability wording conflicts. Cisco\'s UCS C845A M8 is one of the servers that carries this GPU.',
  ),
  'h200-nvl': d(
    'A Hopper-generation data-center GPU, the first with HBM3e (141 GB at 4.8 TB/s). The SXM part goes in HGX systems; H200 NVL is the air-cooled PCIe variant for enterprise racks. It is a previous-generation part.',
    [
      f('Memory', '141 GB of HBM3e at 4.8 TB/s per GPU.'),
      f('H200 NVL', 'Up to four GPUs bridged by NVLink at 900 GB/s per GPU, up to 600 W, with multi-instance GPU up to seven instances.'),
      f('H200 SXM', 'Goes into HGX systems of four or eight GPUs, at up to 700 W.'),
      f('Software included', 'H200 NVL includes a five-year NVIDIA AI Enterprise subscription and is sold in MGX and NVIDIA-Certified partner systems.'),
    ],
    [['NVIDIA H200', NV.h200]],
    'It is still named in the RTX PRO AI Factory (as optional) and in the 2-8-9-400 reference architecture, which is why it is on the map, but it is not NVIDIA\'s newest part.',
  ),
  'certified-systems': d(
    'A certification program for partner servers, workstations and edge systems, tested and validated for performance, manageability, scalability and security. The NVIDIA-Certified nodes are the building blocks of the Enterprise Reference Architectures.',
    [
      f('Three categories', 'Servers, workstations and edge systems.'),
      f('What is tested', 'Single-GPU, multi-GPU and multi-node performance, network and storage offload, TPM security and remote management.'),
      f('Certification versus qualification', 'Qualification (thermal, mechanical, power, signal integrity) is a prerequisite, and a separate step from certification.'),
      f('Scale', 'More than 400 systems, from partners including Cisco, Dell, HPE, Lenovo and Supermicro.'),
    ],
    [['NVIDIA-Certified Systems', NV.certSystems]],
    'This is a program rather than hardware. It is placed in Compute because the certified servers are what the reference architectures are built from.',
  ),
  'cisco-ucs': d(
    'Cisco is a listed NVIDIA-Certified server partner. NVIDIA\'s reference-architecture index lists Cisco hardware in its endorsed designs: UCS C885A M8 with HGX, and UCS C845A M8 with RTX PRO 6000 Blackwell Server Edition or H200 NVL.',
    [
      f('Certified server partner', 'NVIDIA states that customers can use UCS systems that are NVIDIA-Certified.'),
      f('Endorsed designs', 'Six Cisco entries are in NVIDIA\'s partner-endorsed designs table, spanning the HGX and RTX PRO reference architectures.'),
      f('Cisco AI POD entries', 'The table lists a Cisco AI POD for the 2-8-9-400 RA (4 to 16 nodes) and a Cisco 2-8-5-200 RA (4 to 32 nodes).'),
    ],
    [['NVIDIA-Certified Systems', NV.certSystems], ['Enterprise Reference Architectures', NV.eraIndex]],
    'Shown here because NVIDIA\'s pages name it, not as an NVIDIA product. NVIDIA marks Cisco\'s infrastructure endorsement "with Spectrum-X elements", so endorsement depends on using Spectrum-X. See the Cisco lens for the products themselves.',
  ),

  // Network
  'spectrum-x': d(
    'NVIDIA\'s end-to-end, AI-optimised Ethernet platform for multi-tenant generative AI factories, made of Spectrum switches, SuperNICs and software.',
    [
      f('Switches', 'SN5000 and SN6000 series; the newest Spectrum-6 ASIC (102.4 Tb/s per chip) is tied to Vera Rubin.'),
      f('SuperNICs', 'BlueField-3 for the Hopper generation, ConnectX-8 at 800 Gb/s for Blackwell, and ConnectX-9 at 1.6 Tb/s per GPU for Vera Rubin.'),
      f('AI traffic handling', 'Adaptive routing and telemetry-based congestion control, with tenant performance isolation.'),
      f('Reach and tooling', 'Spectrum-XGS joins multiple data centers; SONiC and Cumulus are supported; Minerva provides observability and DSX Air simulation.'),
    ],
    [['Spectrum-X Ethernet', NV.spectrumX]],
    'The Spectrum-6 / SN6000 generation tied to Vera Rubin has no dates on the page, so treat it as ramping. Cisco Nexus N9100 switches use Spectrum-X silicon.',
  ),
  'spectrum-x-photonics': d(
    'Spectrum-X Ethernet switches with the optics co-packaged on the switch ASIC package, which replaces the pluggable transceivers that are otherwise a large part of a switch\'s power and failure budget.',
    [
      f('Switches', 'The SN6800 and SN6810; the SN6800 is 409.6 Tb/s, as 512 ports at 800G or 2,048 at 200G.'),
      f('Power', 'NVIDIA states 5x lower power per 1.6 Tb/s port than pluggable optics.'),
      f('Uptime', 'NVIDIA states 5x longer link-flap-free uptime.'),
    ],
    [['Silicon photonics', NV.photonics], ['Photonics developer blog', 'https://developer.nvidia.com/blog/scaling-power-efficient-ai-factories-with-nvidia-spectrum-x-ethernet-photonics/']],
    'Announced, not confirmed shipping. NVIDIA\'s page says available in the second half of 2026 and ramping to full production; no shipping confirmation was found as of October 2026.',
  ),
  'quantum-x': d(
    'NVIDIA\'s InfiniBand platform for AI and HPC, with switches, ConnectX adapters, BlueField DPUs, cables and UFM management. Quantum-X800 is the compute fabric in NVIDIA\'s published SuperPOD reference architectures.',
    [
      f('In-network aggregation', 'SHARP offloads collective operations into the switch.'),
      f('Fabric behaviour', 'Adaptive routing, congestion control and a self-healing network, with fat-tree and Dragonfly+ topologies.'),
      f('SuperPOD fabric', 'The Quantum-X800 Q3400 series (XDR, 800 Gb/s) carries the compute fabric in the DGX SuperPOD reference architectures.'),
      f('Photonics switch', 'Quantum-X Photonics (Q3450-LD) has 144 ports at 800G with co-packaged optics, for 10,000+ GPUs in a two-level fat tree.'),
    ],
    [['InfiniBand', NV.infiniband], ['Silicon photonics', NV.photonics]],
    'Quantum-X Photonics dates conflict: a March 2025 NVIDIA release said later in 2025, a developer blog said early 2026, and no shipping confirmation was found. The InfiniBand product page does not itself use the name Quantum-X Photonics.',
  ),
  nvlink: d(
    'NVIDIA\'s GPU-to-GPU interconnect. NVLink links GPUs inside a server; the NVLink Switch extends all-to-all connectivity across a rack. NVIDIA calls it the scale-up network of the AI factory.',
    [
      f('Fifth generation', '1,800 GB/s per GPU and 130 TB/s across 72 GPUs on Blackwell.'),
      f('Sixth generation', '3,000 GB/s per GPU and 216 TB/s for the Vera Rubin NVL72.'),
      f('In-network reductions', 'The switch engines support SHARP for reductions inside the switch.'),
      f('NVLink Fusion', 'Lets partners pair NVLink with semi-custom ASICs or CPUs.'),
    ],
    [['NVLink', NV.nvlink], ['NVLink as the scale-up network', NV.nvlinkBlog]],
    'NVIDIA files NVLink under Data Center, not Networking (the page is at /data-center/nvlink/); it is placed in Network here because NVIDIA calls it the scale-up network. Sixth-generation figures are marked preliminary.',
  ),
  connectx: d(
    'The network adapters for AI compute fabrics. SuperNIC is the class tuned for hyperscale AI on Ethernet, and the adapter side of both Spectrum-X and InfiniBand.',
    [
      f('ConnectX-8', 'Up to 800 Gb/s with PCIe Gen6, used in the DGX B300 and the GB300 NVL72.'),
      f('ConnectX-9', 'Up to 1.6 Tb/s per GPU, used in the Vera Rubin NVL72.'),
      f('What they offload', 'RoCE, collective offload and telemetry that supports adaptive routing, per the Spectrum-X page.'),
    ],
    [['ConnectX SuperNIC', NV.supernic], ['Spectrum-X', NV.spectrumX]],
    'The SuperNIC product page is a thin menu page, and the Spectrum-X page also calls BlueField-3 a SuperNIC, so the boundary between the two products is blurred in NVIDIA\'s own wording.',
  ),
  bluefield: d(
    'The data processing unit: it offloads, accelerates and isolates networking, storage and security services from the host CPU. NVIDIA files BlueField under Networking, and programs it through DOCA.',
    [
      f('Generations', 'BlueField-3 at 400 Gb/s and BlueField-4 at 800 Gb/s, which NVIDIA positions for gigascale AI factories.'),
      f('In-silicon security', 'Zero-trust security in hardware, with NVIDIA Sentry for out-of-band monitoring and quarantine of AI agents.'),
      f('Storage', 'RDMA, NVMe-oF and GPUDirect Storage, and the BlueField-4 STX storage processor.'),
      f('Where it appears', 'In DGX B300 and B200 (two per system), in the ERAs as SuperNIC and DPU, and inside the Vera Rubin NVL72.'),
    ],
    [['BlueField DPU', NV.dpu], ['DOCA security', NV.docaSecBlog]],
    'BlueField-3 is current. BlueField-4 is listed as current on the product page, but NVIDIA\'s announcements give the second half of 2026 for partner platforms, and no confirmation was found that it has shipped.',
  ),
  doca: d(
    'The software framework for BlueField DPUs, SuperNICs and ConnectX: an SDK, libraries and a runtime for building and running applications on them.',
    [
      f('Open interfaces', 'Open APIs, libraries and drivers, including DPDK, SPDK and Netlink.'),
      f('Containerised services', 'A runtime that deploys containerised services across many DPUs.'),
      f('What it accelerates', 'RDMA and GPUDirect, SDN, VirtIO emulation, inline crypto and storage.'),
      f('Host side', 'The DOCA-Host package runs on Arm and x86 hosts.'),
    ],
    [['DOCA', NV.doca]],
    'NVIDIA files DOCA under developer networking. It is software, so it could equally sit under Platform; it is placed with BlueField, which it programs.',
  ),
  'cisco-n9100': d(
    'A Cisco switch series that NVIDIA says is powered by NVIDIA Spectrum-X Ethernet switch silicon. Cisco was one of four system makers NVIDIA named in the announcement, alongside Dell, HPE and Supermicro.',
    [
      f('Silicon', 'Built on Spectrum-X Ethernet switch silicon rather than Cisco Silicon One.'),
      f('Availability', 'Cisco said it would be orderable before the end of 2025.'),
      f('Reference architecture', 'Cisco said it would offer an NVIDIA Cloud Partner-compliant AI factory on a Cisco Cloud reference architecture.'),
    ],
    [['NVIDIA announcement, 28 October 2025', NV.n9100]],
    'Read from NVIDIA\'s announcement only. It is a Cisco product, not an NVIDIA one, and no NVIDIA page ties Cisco Silicon One to the N9100.',
  ),
  'cisco-silicon-one': d(
    'NVIDIA and Cisco announced a pluggable optics form factor so that Cisco Silicon One-based Ethernet networks can work with NVIDIA Spectrum-X in AI factories.',
    [
      f('The optics', 'A USFP module at 400 Gb/s per lane, the first planned transceivers of the new form factor.'),
      f('Open specification', 'The form factor is to become an open spec through a future multi-source project; TE Connectivity and Amphenol are cited.'),
      f('What it joins', 'Cisco Silicon One-based networks with NVIDIA Spectrum-X Ethernet.'),
    ],
    [['NVIDIA and Cisco announcement, 12 October 2026', NV.ciscoOptics]],
    'Announced only: the transceivers are described as first planned, with no ship date. A Cisco product, shown because NVIDIA names it. It is a different silicon family from the Spectrum-X silicon in the Nexus N9100.',
  ),

  // Data and storage
  'ai-data-platform': d(
    'A customisable reference design that integrates NVIDIA accelerated computing into enterprise storage, so unstructured data is prepared for agentic AI. Storage partners build products on it.',
    [
      f('Components', 'Blackwell GPUs, BlueField-3 DPUs, Spectrum-X Ethernet, NIM, NeMo Retriever, cuVS and DOCA.'),
      f('Continuous indexing', 'Multimodal data is indexed continuously for hybrid search and retrieval, in place.'),
      f('Zero trust', 'Granular policies and accelerated encryption at rest and in transit.'),
      f('Reference workflows', 'Multimodal agentic RAG, a video search and summarisation agent, and a deep research agent.'),
    ],
    [['AI Data Platform', NV.aidp], ['Certified Storage blog', NV.certStorageBlog]],
    'A reference design, not a product: what ships depends on each partner, and NVIDIA\'s page does not separate shipping from announced per partner. Certified Storage is a prerequisite for partners.',
  ),
  'certified-storage': d(
    'A program that assesses and certifies partner storage platforms for AI factory use, with NVIDIA acting as the first customer in production qualification.',
    [
      f('Three tiers', 'Foundation (up to 256 GPUs), Enterprise (up to 4,000) and NCP, for cloud partners (about 100,000 GPUs).'),
      f('Workloads validated', 'Training and checkpointing, fine-tuning, inference, KV cache, retrieval and agentic workflows.'),
      f('Exact configurations', 'Certification covers the exact configuration tested and is not transferable to a product family.'),
      f('In the reference architectures', 'Storage certification is included in the Enterprise Reference Architectures.'),
    ],
    [['Certified Storage', NV.certStorage], ['Announcement blog', NV.certStorageBlog]],
    'The product page names 12 partners including Cisco, but the March 2025 blog names 10 without Cisco, and the page does not say which Cisco product. The docs defer to a separate systems list that was not read.',
  ),
  'stx-cmx': d(
    'STX is a modular reference architecture for accelerated storage for agentic AI, built on a Vera CPU and ConnectX-9. CMX is its first rack-scale implementation, adding an Ethernet-attached flash tier for the inference KV cache.',
    [
      f('Storage controller', 'BlueField-4 controls the NVMe flash in CMX.'),
      f('Context memory', 'Holds KV cache between GPU or host memory and shared storage, so long contexts do not recompute.'),
      f('Used with', 'Spectrum-X, DOCA and NVIDIA AI Enterprise, per the release.'),
      f('Partners named', 'The release names storage vendors including Cloudian, DDN, Dell, Everpure, Hitachi Vantara, HPE, IBM, MinIO, NetApp, Nutanix, VAST and WEKA.'),
    ],
    [['STX announcement', NV.stx]],
    'Announced, not confirmed shipping. The March 2026 release gives partner availability in the second half of 2026, with products offered when and if available. The 5x performance claims are NVIDIA\'s.',
  ),
  'gpudirect-storage': d(
    'A direct memory-access path between storage and GPU memory that bypasses the CPU bounce buffer, used through the cuFile API.',
    [
      f('cuFile API', 'A POSIX-like API that reads into and writes from GPU buffers, with stream-ordered and batch variants.'),
      f('Routing', 'Dynamic routing across GPU and NIC paths, including over NVLink.'),
      f('Compatibility mode', 'Falls back to the normal path when direct access is not available.'),
      f('Named file systems', 'Works with DDN EXAScaler, VAST NFS, WekaFS, Lustre, NFS and local NVMe.'),
    ],
    [['GPUDirect Storage overview guide', NV.gds]],
  ),
  'magnum-io': d(
    'NVIDIA\'s SDK for moving data between CPUs, GPUs, DPUs and storage, to cut IO bottlenecks in AI, HPC and data science. It spans network IO, storage IO, in-network computing and IO management.',
    [
      f('Network IO', 'GPUDirect RDMA, NCCL, NVSHMEM and HPC-X.'),
      f('Storage IO', 'GPUDirect Storage and SNAP.'),
      f('In-network computing', 'SHARP, which does reductions inside the switch.'),
      f('IO management', 'NetQ, UFM and What Just Happened telemetry.'),
    ],
    [['Magnum IO', NV.magnumIo]],
    'The page text is dated (it mentions Quantum-2 at 400 Gb/s). NIXL, used by Dynamo, is listed under CUDA-X communication rather than Magnum IO.',
  ),
  cuvs: d(
    'An open-source library for GPU-accelerated vector search and clustering, which speeds up index builds and search in existing databases. It is included in NVIDIA AI Enterprise production branch 6.',
    [
      f('Index types', 'Exact, tree and graph indexes on the GPU, with GPU-built indexes usable for CPU search.'),
      f('Scale', 'Out-of-core builds and real-time embedding updates.'),
      f('Integrations', 'FAISS, Milvus, Lucene, Solr, Elastic, OpenSearch, Weaviate, Kinetica and DataStax.'),
      f('APIs', 'C, C++, Rust, Java, Python and Go.'),
    ],
    [['cuVS', NV.cuvs]],
    'Benchmark figures on the page are NVIDIA\'s own and are internally inconsistent (29x in one place, 34x in another), so none is quoted here.',
  ),
  'nemo-retriever': d(
    'A collection of microservices, built on NIM, with a single API for indexing and querying enterprise data. It extracts text, tables and images for downstream generative applications.',
    [
      f('Extraction', 'A library that pulls text, tables and images out of documents, with object-detection and OCR NIMs.'),
      f('Embedding and reranking', 'Text embedding and text reranking NIMs for retrieval.'),
      f('Part of the AI Data Platform', 'NVIDIA lists it as a component of the reference design.'),
    ],
    [['NeMo Retriever', NV.retriever], ['AI Data Platform', NV.aidp]],
    'NeMo Microservices carries a notice that it will be sunset on 1 October 2026, with development moving to the NeMo Platform. The Retriever page itself did not mention this, so the naming may change.',
  ),
  'storage-partners': d(
    'The storage vendors NVIDIA names across its Certified Storage program, the AI Data Platform and its reference architectures. They are shown as one entry because NVIDIA publishes them as lists, not as products.',
    [
      f('Certified Storage page', 'Cisco, Cloudian, Dell, DDN, Pure Storage (shown as Everpure), Hitachi Vantara, HPE, IBM, NetApp, Nutanix, VAST and WEKA.'),
      f('AI Data Platform page', 'Cloudian, DDN, Dell, Pure Storage, Hammerspace, HPE, Hitachi Vantara, IBM, NetApp, Nutanix, VAST and WEKA.'),
      f('SuperPOD certified list', 'DDN, IBM, VAST, NetApp, Dell PowerScale, WEKA and Pure Storage.'),
    ],
    [['Certified Storage', NV.certStorage], ['AI Data Platform', NV.aidp], ['DGX SuperPOD', NV.superpod]],
    'The lists differ between pages, and NVIDIA\'s own pages name the same vendor Pure Storage and Everpure. Partner product pages were not opened, so which products ship is not confirmed here.',
  ),

  // Platform
  'nvidia-ai-enterprise': d(
    'The commercial, supported software suite for production AI. It bundles NIM microservices, NeMo, Blueprints, Run:ai, operators and drivers, with enterprise support and extended-lifetime production branches.',
    [
      f('Two layers', 'An infrastructure layer (drivers, vGPU, Run:ai, Kubernetes operators, DOCA, Base Command Manager) and an application layer (NIM, NeMo, Omniverse, domain SDKs).'),
      f('Production branches', 'Production branch 6 had its first release in May 2026, with its last planned release in December 2026 and end of life planned for January 2027.'),
      f('Support', 'Enterprise support, a secure software supply chain and vulnerability mitigation, with Government Ready versions of most components.'),
      f('Where it runs', 'On NVIDIA-Certified systems, the major cloud marketplaces and OCI, on the Kubernetes platforms and hypervisors in its support matrix.'),
    ],
    [['AI Enterprise', NV.aie], ['AI Enterprise release 8', NV.aieDocs], ['Support matrix 8.2', NV.aieMatrix]],
    'Run:ai is excluded from the 90-day trial licence. The component list is the union of several pages, because no single page states what is included. Dynamo\'s inclusion is mixed. The page for the product itself returned 404 on one path.',
  ),
  nim: d(
    'Microservices that package foundation models for deployment on any cloud or data center, with production-grade runtimes and ongoing security updates.',
    [
      f('Model domains', 'Language, embedding and reranking, NemoGuard safety models, vision and video, speech, biology, Earth-2 and medical imaging.'),
      f('Blueprints', 'Built on by AI Blueprints such as multimodal RAG and the digital human.'),
      f('Licensing', 'Nemotron NIMs require an AI Enterprise licence.'),
      f('Kubernetes lifecycle', 'The NIM Operator caches models, autoscales on DCGM and NIM metrics, and supports air-gapped installs.'),
    ],
    [['NIM documentation', NV.nim], ['NIM Operator', NV.nimOperator]],
    'The documentation index does not give a version status for each NIM. The release notes list specific NIMs in production branch 6.',
  ),
  nemo: d(
    'A modular suite of APIs and libraries for the agent lifecycle: building, deploying and optimising agents, from data curation through to evaluation and guardrails.',
    [
      f('Microservices', 'Customizer (fine-tuning), Evaluator, Retriever and Guardrails, and Data Designer in early access.'),
      f('Open-source framework', 'Curator, RL, AutoModel, Megatron-Bridge and Export-Deploy to TensorRT, TensorRT-LLM, vLLM and Triton, among others.'),
      f('Agent Toolkit', 'Framework-agnostic profiling, evaluation and observability for agentic systems.'),
      f('NeMo Platform', 'The 26.3 release is a single Helm chart for Kubernetes with a new CLI and SDK.'),
    ],
    [['NeMo documentation', NV.nemo], ['NeMo Customizer reference', NV.nemoCustomizer]],
    'NeMo Microservices was sunset on 1 October 2026, with development moving to the NeMo Platform, now at version 0.x with no stated general availability. The documentation hub still lists the old microservices, so names such as Customizer, Evaluator, Guardrails and Retriever are in transition.',
  ),
  'ai-blueprints': d(
    'Workflows and code samples for building AI applications from the ground up. AI Enterprise includes the blueprints with reference code, sample data and Helm charts.',
    [
      f('General', 'A RAG pipeline, a video search and summarisation agent, a deep researcher agent and streaming data to RAG.'),
      f('Operations', 'An AI factory operations agent and the Omniverse DSX digital twin for AI factories.'),
      f('Vertical', 'Finance fraud detection, retail, life sciences and telecom examples.'),
    ],
    [['Blueprints catalogue', NV.blueprints], ['AI Enterprise', NV.aie]],
    'The index lists about 35 blueprints without a status for each or deployment steps. Items named NemoClaw are new and were not researched.',
  ),
  dynamo: d(
    'An open-source, low-latency, modular inference framework for serving generative AI across distributed GPU environments, supporting SGLang, TensorRT-LLM and vLLM. NVIDIA describes it as the successor to Triton Inference Server.',
    [
      f('Disaggregated serving', 'Separates the prefill and decode phases onto different GPUs.'),
      f('KV-aware router', 'Routes requests to the GPUs that already hold the relevant cache.'),
      f('KV Block Manager', 'Moves cached state to CPU memory, SSD or network storage.'),
      f('NIXL and Grove', 'Low-latency data transfer between GPUs, memory and storage, and topology-aware scaling on Kubernetes.'),
    ],
    [['Dynamo', NV.dynamo], ['NIM Operator', NV.nimOperator]],
    'Support under AI Enterprise is mixed: the Dynamo page says AI Enterprise will include it in a future release, yet an enterprise-supported operator appears in NGC. The NIM Operator\'s Dynamo integration is marked experimental.',
  ),
  'tensorrt-llm-triton': d(
    'TensorRT-LLM is an open-source library for optimising LLM inference on NVIDIA GPUs. Triton Inference Server is the open-source, multi-framework model server. Both are in the AI Enterprise production branch.',
    [
      f('TensorRT-LLM optimisations', 'Tensor, pipeline and expert parallelism, FP4 and FP8 quantisation, in-flight batching, paged KV cache and speculative decoding.'),
      f('Triton serving', 'Serves TensorRT, PyTorch, ONNX, OpenVINO and RAPIDS FIL models, with dynamic batching and HTTP and gRPC endpoints.'),
      f('Works with Dynamo', 'TensorRT-LLM integrates with Dynamo and with Triton.'),
    ],
    [['TensorRT-LLM', NV.trtllm], ['Triton', NV.triton], ['AI Factory design guide', NV.ecosystem]],
    'The AI Factory design guide calls it Dynamo-Triton while the Triton user guide and production branch table still say Triton Inference Server. The rename could not be confirmed, so the two are treated as one product.',
  ),
  'run-ai': d(
    'A platform for scheduling AI workloads and GPUs on Kubernetes across on-premises, cloud and hybrid. It is open source, with a support-entitled release for NVIDIA enterprise support, and is included in AI Enterprise and Mission Control.',
    [
      f('GPU scheduling', 'Dynamic and fractional GPU allocation, with memory swapping.'),
      f('Governance', 'Quotas, priorities and access policy by project and department.'),
      f('Workload types', 'Training, distributed training and inference, across multiple clusters.'),
      f('Support', 'Run:ai 2.26 is in AI Enterprise infrastructure release 8.2, both self-hosted and as a SaaS.'),
    ],
    [['Run:ai documentation', NV.runai], ['Run:ai', NV.runaiPage], ['Support matrix 8.2', NV.aieMatrix]],
    'NVIDIA files Run:ai under software; the docs place it in the AI Enterprise infrastructure layer and Mission Control bundles it, so it sits on the Platform and Operations boundary. Placed here as GPU orchestration for Kubernetes.',
  ),
  'k8s-operators': d(
    'Kubernetes operators that automate the lifecycle of NVIDIA software: the GPU stack, NIC and RDMA networking, and NIM deployment.',
    [
      f('GPU Operator', 'Manages drivers, the device plugin, the Container Toolkit, GPU Feature Discovery, DCGM monitoring, MIG Manager and the GDS driver.'),
      f('Network Operator', 'Manages NIC drivers and the RDMA device plugin through a NicClusterPolicy.'),
      f('NIM Operator', 'Custom resources for NIM caches, services and pipelines, with model caching, autoscaling and monitoring.'),
    ],
    [['GPU Operator', NV.gpuOperator], ['NIM Operator', NV.nimOperator], ['Support matrix 8.2', NV.aieMatrix]],
    'The Network Operator documentation could not be read (404), so its details come from the AI Enterprise support matrix and search snippets. The NIM Operator\'s Dynamo and Kata integrations are experimental.',
  ),
  'k8s-platforms': d(
    'The Kubernetes platforms NVIDIA AI Enterprise lists as supported. They are third-party products, shown as one entry because NVIDIA publishes them as a support matrix.',
    [
      f('On bare metal', 'Red Hat OpenShift 4.18 to 4.22, Nutanix NKP 2.12 and 2.13, upstream Kubernetes 1.32 to 1.36, RKE2, Charmed Kubernetes and HPE Ezmeral.'),
      f('Virtualised', 'VMware vSphere Kubernetes Service, plus vSphere 8.0 and 9.0, Nutanix AHV and KVM on RHEL as hypervisors.'),
      f('Managed cloud', 'EKS, GKE, AKS and managed OpenShift.'),
      f('Per-component support', 'Each row says whether the GPU, Network and DPU operators and Run:ai are supported on it.'),
    ],
    [['Support matrix 8.2', NV.aieMatrix], ['AI Factory design guide', NV.ecosystem]],
    'This is the infrastructure release 8.2 matrix as summarised from NVIDIA\'s page. Hyper-V and Proxmox are not listed. Red Hat OpenStack is a supported hypervisor but its versions are not given.',
  ),

  // Security
  'doca-security': d(
    'Security services from DOCA that run on BlueField, outside the host workload domain: runtime threat detection, enforcement in the data path, and zero-trust access to AI storage.',
    [
      f('DOCA Argus', 'Detects runtime threats by agentless inspection of host memory. NVIDIA claims detection up to 1,000x faster than existing agentless solutions.'),
      f('DOCA Flow', 'Traffic inspection, segmentation and enforcement in the data path, with an L4 firewall and hooks for partner L7 firewalls.'),
      f('DOCA Vault', 'Policy-based access control for file-based AI storage, enforced inline in silicon, to block exfiltration.'),
      f('Telemetry export', 'Argus exports to SIEM, SOAR and XDR systems.'),
    ],
    [['DOCA security blog, May 2026', NV.docaSecBlog], ['DOCA Argus', NV.argusBlog]],
    'DOCA App Shield and IPsec are not named on any page read, so they are not included. The May 2026 blog describes BlueField-4; no page confirms BlueField-4 has shipped, and the Argus blog gives no general-availability date.',
  ),
  sentry: d(
    'An out-of-band watchdog on BlueField-4 DPUs, built on DOCA, in a hardware trust domain separate from the host. It monitors AI agents and enforces policy on their access to models, tools and data.',
    [
      f('DOCA Tower', 'An Envoy-based AI security gateway that terminates TLS and inspects agent traffic at layer 7 with Open Policy Agent rules.'),
      f('Per-agent firewall', 'DOCA Flow provides an L4 firewall in silicon for each agent.'),
      f('Agent traffic', 'Inspects requests and responses, redacts PII and secrets, and governs A2A and MCP traffic.'),
      f('Containment', 'Can contain an agent in hardware within milliseconds, with attested, tamper-evident telemetry.'),
    ],
    [['Inside NVIDIA Sentry', NV.sentryBlog], ['Open Agent Safety Platform', NV.agentSafety]],
    'Announced. The developer blog says planned availability "early next year", and the 28 September 2026 release calls it a reference system design with no availability stated, offered when and if available.',
  ),
  openshell: d(
    'An open-source secure runtime that sets boundaries for autonomous agents, keeping policy enforcement separate from the agent workload. It is the software layer of NVIDIA\'s Open Agent Safety Platform.',
    [
      f('Sandboxed execution', 'Agents run in a sandbox, with policy enforced outside the agent process.'),
      f('Reference architecture', 'Components named Gateway, Supervisor, Sandbox and Policy Prover; Sentry adds an optional hardware layer.'),
      f('Where it runs', 'On Vera CPUs, and can be extended to Arm and Intel.'),
    ],
    [['Open Agent Safety Platform, 28 September 2026', NV.agentSafety]],
    'Described as broadly available on 28 September 2026. Only the press release and the Sentry blog were read; the OpenShell reference-architecture blog and the agent-safety solutions page were seen only in search results.',
  ),
  'confidential-computing': d(
    'Hardware-based trusted execution that protects AI models and data while they are in use, covering inference and fine-tuning, now in its third generation with Rubin.',
    [
      f('Supported GPUs', 'Hopper, Blackwell and Rubin.'),
      f('What it protects', 'Model weights, training data and prompts at runtime, with no application changes. NVIDIA states up to 98% of unsecured performance.'),
      f('Attestation', 'Hardware-rooted remote attestation.'),
      f('Deployment', 'As confidential bare metal, confidential containers on Kubernetes, or confidential VMs.'),
    ],
    [['Confidential Computing', NV.confidential]],
    'The documentation page for it returned 404, and Cisco is not mentioned. The Rubin-specific features follow the Rubin timeline, which the page does not date.',
  ),
  'nemo-guardrails': d(
    'An open-source Python package, with a production microservice form, that adds programmable guardrails to LLM applications. It blocks, alters or validates unsafe or off-topic inputs and outputs without changing the model.',
    [
      f('Five rail types', 'Input, retrieval, dialog, execution and output rails at different stages.'),
      f('Built-in controls', 'Content safety, jailbreak detection, topic control and PII detection, through LLM self-checks, NVIDIA safety models or third-party ones.'),
      f('Agentic', 'Tool input and output validation, with LangGraph integration.'),
      f('Integrations', 'The documentation lists LlamaGuard, Fiddler, ActiveFence, Presidio and Cisco AI Defense, among others.'),
    ],
    [['NeMo Guardrails documentation', NV.guardrails]],
    'NVIDIA files it under NeMo, so it also appears as a NeMo Microservices component affected by the 1 October 2026 sunset notice. Placed in Security because it is a safety and policy control.',
  ),
  'safety-nims': d(
    'Content-safety classifier models, packaged as NIM microservices, that label prompts and responses safe or unsafe. NeMo Guardrails uses them as rails.',
    [
      f('Content safety', 'The Llama 3.1 NemoGuard 8B Content Safety model.'),
      f('Jailbreak detection', 'The NemoGuard Jailbreak Detection NIM.'),
      f('Topic control', 'The NemoGuard Topic Control NIM.'),
    ],
    [['NeMo Guardrails documentation', NV.guardrails], ['NIM documentation', NV.nim]],
    'Naming has changed several times (NemoGuard, then Nemotron Safety Guard, then Nemotron 3.5 Content Safety), and some containers are deprecated or experimental. Treat the current model names as unverified.',
  ),
  morpheus: d(
    'A GPU-accelerated, end-to-end AI framework for building applications that filter, process and classify large volumes of streaming security data across data center, cloud and edge.',
    [
      f('Digital fingerprinting', 'Builds behavioural profiles of users and machines to flag anomalies.'),
      f('Workflows', 'A spear-phishing detection workflow with Helm charts and notebooks, and generative AI capabilities for analysis and synthetic training data.'),
      f('Models', 'Anomaly profiling with RAPIDS FIL and graph neural network fraud detection, deployed with Triton.'),
    ],
    [['Morpheus', NV.morpheus], ['Agentic AI for cybersecurity', 'https://blogs.nvidia.com/blog/agentic-ai-cybersecurity/']],
    'Open source and shipping, but most of the source material dates from 2021 and 2022, and the page does not mention BlueField or NIM. Production use is tied to NVIDIA AI Enterprise.',
  ),
  'cisco-ai-defense': d(
    'Cisco\'s AI security product. NVIDIA\'s pages document it as an integration of NeMo Guardrails and of the AI Enterprise ecosystem, and a June 2025 NVIDIA blog announced it with Cisco Hypershield.',
    [
      f('Integration', 'NeMo Guardrails\' documentation lists Cisco AI Defense as a supported integration.'),
      f('Ecosystem', 'NVIDIA\'s AI Factory design guide describes it as an end-to-end AI security solution for applications across the lifecycle, integrated with AI Enterprise.'),
      f('Runtime', 'The June 2025 blog describes runtime monitoring of AI apps and agents, validation of open models and Cisco models running as NIM.'),
    ],
    [['NVIDIA and Cisco security blog', NV.ciscoSecurityBlog], ['AI Factory design guide', NV.ecosystem]],
    'A Cisco product, shown because NVIDIA names it. Cisco Hypershield working with BlueField and DOCA Argus is in the future tense in the blog, so it is not claimed. See the Cisco lens for the product itself.',
  ),
  'security-partners': d(
    'Security vendors NVIDIA names as validated with BlueField on its AI factory designs, shown as one entry because NVIDIA publishes them as a list.',
    [
      f('Named in January 2026', 'Check Point Infinity AI Cloud Protect, Fortinet FortiGate-VM, Palo Alto Networks Prisma AIRS and Trend Micro Trend Vision One.'),
      f('Also named', 'Armis Centrix, F5 BIG-IP Next for Kubernetes, Rafay, Red Hat OpenShift and Spectro Cloud PaletteAI.'),
      f('How they use BlueField', 'Several use DOCA Argus telemetry for host-independent detection.'),
    ],
    [['BlueField validated design blog, January 2026', NV.bluefieldSecurityBlog]],
    'That blog does not name Cisco. Cisco appears in a separate October 2025 BlueField-4 launch post among security partners, and in the September 2026 Open Agent Safety Platform release with no product given.',
  ),

  // Operations and agents
  'mission-control': d(
    'The integrated AI factory management platform, for workload scheduling, orchestration, monitoring and recovery on DGX B200 and B300 and GB200 and GB300 NVL72. It is designed to run alongside NVIDIA AI Enterprise.',
    [
      f('Autonomous recovery', 'Detects, isolates and recovers from failures without manual steps. NVIDIA claims recovery 10x faster.'),
      f('Continuous health checks', 'Across hardware and the cluster for the life of the infrastructure.'),
      f('Orchestration', 'Includes Run:ai, or integrates Slurm and Kubernetes.'),
      f('Monitoring and power', 'Grafana dashboards, building-management integration and power optimisation, with air-gapped deployment in v2.3.'),
    ],
    [['Mission Control', NV.missionControl], ['Mission Control documentation', NV.missionControlDocs]],
    'The documentation bundles Base Command Manager, Run:ai, UFM and NetQ. DCGM is not on the docs index page, so that link is not drawn. Domain Power Service is an early preview. Cisco is not mentioned on any Mission Control page.',
  ),
  'base-command-manager': d(
    'Software for provisioning, managing and monitoring HPC and AI clusters, from a few nodes to hundreds of thousands, across edge and multi-cloud. Mission Control includes all of its capabilities.',
    [
      f('Cluster management', 'Provisioning, workload management and monitoring in one tool.'),
      f('Workloads', 'Manages Slurm and Run:ai workloads, and provisions upstream Kubernetes and Slurm clusters.'),
      f('Licensing', 'Free up to eight accelerators per system without support, which NVIDIA marks as subject to change; support comes through AI Enterprise.'),
    ],
    [['Base Command Manager', NV.bcm]],
    'The older Base Command Platform name could not be found, so nothing is claimed about it. The Base Command Manager page does not mention Kubernetes; that comes from the AI Enterprise support matrix.',
  ),
  dcgm: d(
    'A suite of tools for managing and monitoring data-center GPUs in a cluster, running on each GPU node. DCGM-Exporter publishes the telemetry to Kubernetes and Prometheus.',
    [
      f('Health monitoring', 'Low-overhead active health monitoring, with active and passive diagnostics and alerts.'),
      f('Governance', 'Power and clock policies for the GPUs.'),
      f('Telemetry', 'Job behaviour telemetry through C and Python APIs, the dcgmi command line and the HostEngine.'),
    ],
    [['DCGM', NV.dcgm], ['GPU Operator', NV.gpuOperator]],
    'Open-core: the foundations are on GitHub and the diagnostics are proprietary. Whether Mission Control includes DCGM is not stated on its documentation index, so that link is not drawn.',
  ),
  ufm: d(
    'NVIDIA\'s management platform for InfiniBand fabrics: it combines real-time network telemetry with AI-powered cyber intelligence for InfiniBand scale-out data centers, and is included in Mission Control.',
    [
      f('UFM Telemetry', 'Monitoring and validation of the fabric.'),
      f('UFM Enterprise', 'Discovery, provisioning, and traffic and congestion monitoring, with Slurm and LSF integration and REST APIs.'),
      f('UFM Cyber-AI', 'Preventive maintenance and anomaly detection, on a dedicated on-premises appliance only.'),
    ],
    [['Unified Fabric Manager', NV.ufm], ['Mission Control documentation', NV.missionControlDocs]],
    'The UFM page lists Quantum-X800 and Quantum-2 as platforms but does not draw an explicit tie, and does not mention Mission Control. The Mission Control documentation lists UFM as included.',
  ),
  netq: d(
    'A scalable network operations toolset for real-time visibility, troubleshooting, correlation and validation of NVLink Switches and Cumulus-based fabrics, using agents on switches and hosts.',
    [
      f('One interface', 'Manages Cumulus Linux and NVOS from one GUI.'),
      f('Telemetry', 'Real-time and flow telemetry, including latency and buffer occupancy, and RoCE monitoring.'),
      f('Validation', 'Snapshot-and-compare of configuration and preventive validation.'),
    ],
    [['NetQ', NV.netq], ['Mission Control documentation', NV.missionControlDocs]],
    'The NetQ page does not mention Spectrum-X, so the link to it is marked unverified. Mission Control includes NetQ for observability across NVLink and Ethernet.',
  ),
  'omniverse-dsx': d(
    'A framework for designing, simulating and operating gigawatt-scale AI factories as digital twins on OpenUSD and Omniverse libraries.',
    [
      f('Digital twin', 'A twin of a reference AI factory site, with thermal simulation.'),
      f('DSX components', 'DSX Sim, DSX Flex (grid-responsive power), DSX MaxLPS (dynamic power), DSX OS (provisioning and fleet health) and the DSX Exchange event bus.'),
      f('800 VDC', 'Includes an 800 VDC power architecture.'),
    ],
    [['Omniverse DSX', NV.dsx]],
    'Only the blueprint is marked generally available; the other DSX components have no stated status. Sample NVL72 configurations in the twin were seen only in a search summary, so no link to the racks is drawn.',
  ),
  'nemo-agent-toolkit': d(
    'An open-source, framework-agnostic toolkit from the NeMo family for building, running, evaluating and observing agent workflows, which also underpins the AI-Q blueprint.',
    [
      f('Frameworks', 'Plugins for LangChain, LangGraph, LlamaIndex, CrewAI, AutoGen, Semantic Kernel, Agno, ADK and Strands.'),
      f('Observability', 'OpenTelemetry, Phoenix and Weave exporters.'),
      f('MCP', 'An MCP client, and an MCP server with authentication.'),
      f('Evaluation', 'Evaluation, profiling and fine-tuning of agent workflows.'),
    ],
    [['NeMo Agent Toolkit documentation', NV.agentToolkit]],
    'Only the documentation navigation could be read, not the overview text. The documentation shows version 1.8 with no general-availability statement. That it was formerly called the Agent Intelligence toolkit is an inference.',
  ),
  'ai-q': d(
    'A self-hosted deep-research agent blueprint built on the NeMo Agent Toolkit, which connects to your own models, data, authentication, policy controls, storage and observability.',
    [
      f('Research pipeline', 'Intelligent query routing, then a multi-agent pipeline with clarifier, shallow and deep researchers and a sandbox.'),
      f('Output', 'Citation-backed answers, with guardrails and human-in-the-loop.'),
      f('Interfaces', 'A REST API and an MCP server.'),
      f('Deployment', 'Docker Compose, Kubernetes or OpenShell.'),
    ],
    [['AI-Q Blueprint documentation', NV.aiq]],
    'The architecture has changed across versions (older ones used Milvus and NeMo Retriever), and the nvidia.com product page returned 404. NVIDIA\'s vulnerability-analysis blueprint reuses its CVE researcher.',
  ),
};

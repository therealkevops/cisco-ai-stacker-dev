// Fuller descriptions for the open-source lens. Each project's licence, governance and release were
// read from its own LICENSE file, foundation page and release feed on 2026-10-22; features and caveats
// come from its README or documentation, paraphrased. "Not checked" means the field was not read.

import { OS } from './oss-urls.js';

const f = (name, text) => ({ name, text });
const AS_OF = 'as of 22 October 2026';
const d = (facts, about, features, refs, caveat) => ({ facts, about, features, refs, ...(caveat ? { caveat } : {}) });
const facts = (licence, cls, governance, release) => [
  ['Licence', licence],
  ['Class', cls],
  ['Governance', governance],
  ['Latest release', release ? `${release} (${AS_OF})` : 'Not checked'],
];
const OSI = 'OSI-approved open source';
const OPEN_VENDOR = 'Open licence, controlled by one company';

export const OSS_PRIMITIVE_SUMMARIES = {
  platform: { summary: 'Orchestration, model serving and agent runtimes: the open projects that turn GPUs into a service, and the open-weight models they serve.' },
  ops: { summary: 'Metrics, tracing, experiment tracking and the open protocols agents use to reach tools and each other.' },
  security: { summary: 'Policy, runtime detection, workload identity, image signing, confidential computing and model guardrails.' },
  network: { summary: 'Kubernetes networking, switch operating systems, GPU collective libraries and the Ultra Ethernet specification.' },
  compute: { summary: 'Frameworks, schedulers and the GPU software stacks the schedulers hand work to.' },
  data: { summary: 'Vector databases, object, file and parallel storage.' },
};

export const OSS_PRIMITIVE_DETAILS = {
  platform: {
    why: 'Open source can serve and orchestrate models end to end, but the pieces come from different projects with different governance. A platform team assembles them, and owns the integration, the upgrades and the support that a vendor would otherwise provide.',
    lookFor: [
      f('Who governs it', 'A foundation with several vendors is a different bet from one company\'s project with an open licence.'),
      f('Release maturity', 'Version 0.x projects and sandbox-stage projects change quickly and may break between releases.'),
      f('Accelerator support', 'Whether the project runs on NVIDIA, AMD and Intel hardware, or mainly on one.'),
      f('Model licences', 'Open-weight models carry their own licences, which can limit use well beyond the software around them.'),
    ],
  },
  compute: {
    why: 'Training and inference jobs need schedulers that place many GPUs at once and share them fairly, and drivers that expose the hardware. The scheduler and framework layer is open; the driver layer for each vendor\'s GPUs is not always.',
    lookFor: [
      f('Gang scheduling', 'All the pods of a job start together or not at all, so a half-started job does not hold GPUs idle.'),
      f('Quota and fair share', 'Queues and borrowing rules between teams.'),
      f('Topology awareness', 'Placing a job on GPUs that are close together on the interconnect.'),
      f('Vendor lock in the lower layers', 'Whether the stack underneath is open or a vendor binary.'),
    ],
  },
  network: {
    why: 'Open networking covers three different things: the Kubernetes pod network, the switch operating system, and the collective libraries that move data between GPUs. Open specifications for the AI fabric itself are new, and their implementations are still arriving.',
    lookFor: [
      f('Kernel requirements', 'eBPF-based tools need a recent Linux kernel.'),
      f('Hardware support', 'Which switch ASICs and network adapters a switch operating system actually supports.'),
      f('Collective libraries by vendor', 'NCCL and RCCL are open but each runs on one vendor\'s GPUs.'),
      f('Specification versus product', 'A published specification is not a shipping, interoperable product.'),
    ],
  },
  data: {
    why: 'Retrieval needs a vector index, training needs fast shared files, and checkpoints and datasets need object storage. The open options are mature in each category, but none carries an AI-specific certification or a vendor service level.',
    lookFor: [
      f('Licence and maintenance changes', 'A storage project can change licence or stop being maintained, as MinIO has.'),
      f('Scale limits', 'Index size and file count where a project stops being a good fit.'),
      f('GPU data paths', 'Whether GPU-direct access to storage is supported and tested.'),
      f('Who runs it', 'Rook, operators and managed offers decide how much operating work falls to you.'),
    ],
  },
  security: {
    why: 'Open projects cover Kubernetes policy, runtime detection, workload identity, image signing, confidential computing and model guardrails. They are separate tools, so someone has to wire them together and write the policies they enforce.',
    lookFor: [
      f('Policies you must write', 'Policy engines enforce only the rules you define.'),
      f('Runtime visibility', 'Kernel-level detection with the needed kernel features and privileges.'),
      f('Supply chain', 'Signed images and models, checked at admission.'),
      f('Protection of data in use', 'Confidential containers need specific CPUs and GPUs, and an attestation service.'),
    ],
  },
  ops: {
    why: 'The monitoring side is open and well established. The newer part is agents: open protocols for reaching tools and for agents to talk to each other, whose specifications and conventions are still moving.',
    lookFor: [
      f('Metrics versus traces', 'Prometheus is for metrics; traces and logs need other components.'),
      f('Standards still in development', 'OpenTelemetry\'s GenAI and GPU conventions are not yet stable.'),
      f('Licence terms of the dashboards', 'Grafana is AGPL, which matters if you embed or modify it.'),
      f('Protocol maturity', 'MCP and A2A are young, and their governance has recently moved.'),
    ],
  },
};

export const OSS_DETAILS = {
  // Platform
  kubernetes: d(
    facts('Apache-2.0', OSI, 'CNCF Graduated project', 'v1.37.1, 23 September 2026'),
    'The open platform for running containerised workloads, with declarative configuration, scheduling, self-healing and an extension API. Every other platform on the maps builds on it or runs on it.',
    [
      f('Declarative workloads', 'Describe the desired state, and controllers keep the cluster matching it.'),
      f('Scheduling and bin packing', 'Places pods by resource requests, with extension points for GPUs and custom schedulers.'),
      f('Extension by CRD', 'Operators and custom resources are how GPU, serving and training software plug in.'),
      f('Self-healing and rollouts', 'Restarts failed containers and rolls out and back changes.'),
    ],
    [['What is Kubernetes', 'https://kubernetes.io/docs/concepts/overview/'], ['CNCF project page', OS.kubernetes]],
    'Upstream Kubernetes is not a complete platform: it provides no built-in storage, logging, monitoring or support. Distributions add those.',
  ),
  kserve: d(
    facts('Apache-2.0', OSI, 'CNCF Incubating project', '0.21.0, 25 September 2026'),
    'A Kubernetes custom resource for serving models, with autoscaling and routing, and backends including vLLM and llm-d for language models.',
    [
      f('InferenceService resource', 'One resource describes a model, its runtime and its scaling.'),
      f('Autoscaling', 'Scales model servers with load, including to zero.'),
      f('Language model backends', 'Serves language models through vLLM and distributed serving through llm-d.'),
      f('Canary and traffic splitting', 'Rolls a new model version out to part of the traffic.'),
    ],
    [['KServe on CNCF', OS.kserve]],
    'KServe manages and routes servers; it is not an inference engine, and it has no vendor-optimised engines or support.',
  ),
  vllm: d(
    facts('Apache-2.0', OSI, 'PyTorch Foundation project', '0.32.0, 18 October 2026'),
    'An inference and serving engine for language models, with an OpenAI-compatible server. It runs on NVIDIA, AMD and Intel accelerators and is the model server inside most other open serving projects.',
    [
      f('OpenAI-compatible API', 'Existing client code works unchanged against the server.'),
      f('Efficient memory use', 'Paged attention and batching keep the GPU busy across many requests.'),
      f('Parallelism options', 'Tensor, pipeline and expert parallelism across GPUs.'),
      f('Many hardware targets', 'NVIDIA, AMD and Intel accelerators are supported.'),
    ],
    [['vLLM repository', OS.vllm]],
    'There is no certified, supported container as there is for NVIDIA\'s inference stack: version choice and tuning fall to you.',
  ),
  sglang: d(
    facts('Apache-2.0', OSI, 'Hosted by the LMSYS non-profit', '0.5.22, 16 October 2026'),
    'A serving framework for language, vision-language and diffusion models, tuned for agentic and large-scale serving, and also a backend for llm-d.',
    [
      f('Structured generation', 'A frontend language for multi-call programs and constrained output.'),
      f('Prefix caching', 'Reuses computed prefixes across requests, which suits agent loops.'),
      f('Large-scale serving', 'Supports disaggregated prefill and decode and expert parallelism.'),
      f('Several model types', 'Serves language, vision-language and diffusion models.'),
    ],
    [['SGLang repository', OS.sglang]],
    'It is governed by a university-linked non-profit rather than a large foundation, and is pre-1.0.',
  ),
  ray: d(
    facts('Apache-2.0', OSI, 'PyTorch Foundation project; Anyscale is the commercial steward', '2.59.0, 2 October 2026'),
    'A distributed runtime with libraries for data processing, training, tuning, reinforcement learning and serving, used to scale Python and AI applications across a cluster.',
    [
      f('Tasks and actors', 'A small API for running Python functions and stateful objects across machines.'),
      f('Ray Train and Data', 'Distributed training and data loading libraries.'),
      f('Ray Serve', 'Model serving with batching and multi-model composition.'),
      f('Runs on Kubernetes', 'KubeRay runs clusters on Kubernetes, and Kueue can queue them.'),
    ],
    [['Ray repository', OS.ray]],
    'Anyscale, the commercial steward, offers the managed product; check which libraries and features you rely on are in the open source.',
  ),
  kubeflow: d(
    facts('Apache-2.0', OSI, 'CNCF Graduated project (24 July 2026)', 'Distribution 26.03.1'),
    'A Kubernetes-native AI platform made of separately versioned projects: Pipelines, Trainer, Katib for tuning, notebooks and a model registry.',
    [
      f('Pipelines', 'Defines and runs multi-step machine learning workflows.'),
      f('Trainer', 'Runs distributed training jobs for PyTorch and other frameworks.'),
      f('Katib', 'Hyperparameter tuning and neural architecture search.'),
      f('Notebooks and registry', 'Notebook servers and a model registry for the team.'),
    ],
    [['Kubeflow on CNCF', OS.kubeflow]],
    'Kubeflow is a family of projects with their own release cadences. The Trainer\'s support for language model fine-tuning is thin: its older fine-tuning helper, TorchTune, is unmaintained.',
  ),
  'llm-d': d(
    facts('Apache-2.0', OSI, 'CNCF Sandbox project (accepted 12 March 2026)', 'v1.0.0, October 2026'),
    'Distributed language model serving on Kubernetes. It adds routing that is aware of the prefix cache and the load, and separates prefill from decode, above vLLM and SGLang model servers.',
    [
      f('Cache-aware routing', 'Sends a request to the replica most likely to hold its prefix.'),
      f('Prefill and decode split', 'Runs the two phases on separate pods to balance latency and throughput.'),
      f('Tiered KV cache', 'Moves cache between GPU memory, host memory and storage.'),
      f('Well-lit paths', 'Benchmarked recipes for specific models and accelerators.'),
    ],
    [['llm-d on CNCF', OS.llmd], ['Well-lit paths', OS.llmdDocs]],
    'It reached version 1.0 only in October 2026 and is a CNCF sandbox project, the earliest stage. Its recipes cover serving only, with no server, network or storage bill of materials.',
  ),
  kagent: d(
    facts('Apache-2.0', OSI, 'CNCF Sandbox project (22 May 2025)', 'Pre-1.0'),
    'A framework for running AI agents on Kubernetes, declared as resources. Its controller exposes gRPC, A2A and MCP interfaces, and agents can use MCP tool servers.',
    [
      f('Agents as resources', 'An agent, its model and its tools are Kubernetes custom resources.'),
      f('MCP tools', 'Connects agents to MCP tool servers.'),
      f('A2A interface', 'The controller exposes agents over the Agent2Agent protocol.'),
      f('Runs where your workloads run', 'Uses Kubernetes access control and deployment.'),
    ],
    [['kagent on CNCF', OS.kagent]],
    'It is pre-1.0 and in the CNCF sandbox: expect interfaces to change.',
  ),
  'open-weight-models': d(
    [
      ['Licence', 'Varies by model: Apache-2.0, MIT variants, OpenMDW and custom licences'],
      ['Class', 'Open-weight; none meets the OSI Open Source AI Definition'],
      ['Governance', 'Each model is controlled by the company that released it'],
      ['Checked', AS_OF],
    ],
    'The main open-weight model families and what each licence allows. They are called open-weight rather than open source, because the weights are released but the training data and recipe generally are not.',
    [
      f('Apache-2.0 models', 'Mistral Large 3 and Small 4, gpt-oss, Gemma 4 and Qwen3.8 27B are Apache-2.0.'),
      f('Custom licences', 'Llama 4 has a 700 million monthly user threshold and a naming requirement; the larger Qwen models have custom licences; Mistral Medium 3.5 has a revenue exception.'),
      f('Nemotron', 'Super and Nano use the NVIDIA Nemotron Open Model License; Ultra uses OpenMDW-1.1.'),
      f('Security models', 'Cisco\'s Foundation-sec-8B is built on Llama 3.1, so that licence still binds in substance.'),
    ],
    [['OSI Open Source AI Definition', OS.modelLicences]],
    'Read the licence of each model, not the family name: licences differ inside one family and can change between releases.',
  ),

  // Compute
  pytorch: d(
    facts('BSD-3-style', OSI, 'PyTorch Foundation project', '2.14.1'),
    'The tensor and deep-learning framework under most training and a lot of inference, with tape-based automatic differentiation and a Python-first execution model.',
    [
      f('Tensors on CPU and GPU', 'NumPy-like arrays that run on accelerators.'),
      f('Autograd', 'Reverse-mode automatic differentiation.'),
      f('Neural network modules', 'torch.nn for building models.'),
      f('Several accelerators', 'NVIDIA CUDA, AMD ROCm and Intel GPUs are supported.'),
    ],
    [['PyTorch Foundation', OS.pytorch]],
    'ROCm support is Linux only, and source builds need a recent C++ compiler.',
  ),
  slurm: d(
    [
      ['Licence', 'GPL-2.0-or-later per file; the Slinky Kubernetes project is Apache-2.0'],
      ['Class', OPEN_VENDOR],
      ['Governance', 'NVIDIA acquired SchedMD, announced 15 December 2025, with a pledge to remain open source and vendor-neutral'],
      ['Latest release', `Documentation for 26.05 (${AS_OF})`],
    ],
    'The job scheduler for HPC and AI clusters. It queues and places parallel jobs, tracks accounting, and supports GPUs as generic resources, with gang scheduling and topology-aware placement.',
    [
      f('Queueing and priority', 'Arbitrates contention for nodes with multifactor priority and backfill.'),
      f('GPU resources', 'Allocates GPUs through its generic-resources plugin.'),
      f('Accounting', 'Tracks usage per user and account through its database daemon.'),
      f('Slinky for Kubernetes', 'A separate project runs Slurm on Kubernetes.'),
    ],
    [['NVIDIA acquires SchedMD', OS.slurm], ['Slurm overview', 'https://slurm.schedmd.com/overview.html']],
    'Since the acquisition the project\'s steward is NVIDIA, so it is no longer an independent company. The pledge is NVIDIA\'s own statement. Some documented features are marked beta.',
  ),
  'kai-scheduler': d(
    facts('Apache-2.0', OSI, 'CNCF Sandbox project (21 December 2025); began as NVIDIA\'s Run:ai scheduler', null),
    'A Kubernetes scheduler for AI workloads, with gang scheduling, hierarchical queues, topology-aware placement and fractional GPUs.',
    [
      f('Gang scheduling', 'Starts all pods of a job together.'),
      f('Hierarchical queues', 'Quota and fair share across teams.'),
      f('Fractional GPUs', 'Shares one GPU between several workloads.'),
      f('Topology awareness', 'Places jobs on close-together GPUs.'),
    ],
    [['KAI Scheduler on CNCF', OS.kai]],
    'It is the scheduler core of NVIDIA\'s Run:ai, which adds a control plane, a user interface and support. The repository moved to the kai-scheduler organisation.',
  ),
  volcano: d(
    facts('Apache-2.0', OSI, 'CNCF Incubating project', 'v1.16.0'),
    'A batch scheduling system for Kubernetes, used for AI, machine learning, HPC and big data, adding gang scheduling, queues and job lifecycle management.',
    [
      f('Gang scheduling', 'Runs all of a job\'s pods or none.'),
      f('Queues and fair share', 'Divides cluster resources between queues.'),
      f('Job API', 'A job resource for training frameworks.'),
      f('Plugin-based policy', 'Scheduling behaviour is configured with plugins.'),
    ],
    [['Volcano on CNCF', OS.volcano]],
    'It replaces or extends the default scheduler; run it with another scheduler only after checking how they interact.',
  ),
  kueue: d(
    facts('Apache-2.0', OSI, 'Kubernetes SIG Scheduling project', 'v0.20.2'),
    'Job queueing for Kubernetes: queues, quota, cohorts that borrow capacity and preemption, without replacing the default scheduler.',
    [
      f('Quota and cohorts', 'Teams get a quota and can borrow unused capacity.'),
      f('Preemption', 'Higher-priority jobs can reclaim capacity.'),
      f('Job integrations', 'Works with Kubernetes jobs, RayJob and Kubeflow training jobs.'),
      f('Admission, not placement', 'Decides when a job may start; the scheduler places its pods.'),
    ],
    [['Kueue overview', OS.kueue]],
    'The Kubeflow TrainJob integration is alpha.',
  ),
  'gpu-operator': d(
    facts('Apache-2.0', OPEN_VENDOR, 'Controlled by NVIDIA', null),
    'Installs and manages NVIDIA\'s GPU software on Kubernetes: the driver, container toolkit, device plugin and monitoring, as an operator.',
    [
      f('Driver management', 'Deploys the GPU driver as a container.'),
      f('Device plugin', 'Advertises GPUs to Kubernetes.'),
      f('Monitoring', 'Deploys GPU telemetry that DCGM-Exporter publishes.'),
      f('Confidential mode', 'Sets confidential computing mode in NVIDIA\'s Confidential Containers reference architecture.'),
    ],
    [['GPU Operator repository', OS.gpuOperator]],
    'The operator is open source but the driver stack it deploys is NVIDIA\'s. GPUDirect RDMA needs NVIDIA\'s separate Network Operator.',
  ),
  rocm: d(
    [
      ['Licence', 'Per component, mostly MIT; some parts binary-only'],
      ['Class', OPEN_VENDOR],
      ['Governance', 'Controlled by AMD'],
      ['Repository', 'ROCm/ROCm archived 19 October 2026; work moved to TheRock'],
    ],
    'AMD\'s GPU software stack: drivers, libraries and compilers for AMD accelerators, including the collective library RCCL.',
    [
      f('Per-component licensing', 'Each component has its own licence; most are MIT.'),
      f('AMD GPUs only', 'It targets AMD accelerators.'),
      f('PyTorch support', 'PyTorch builds against ROCm on Linux.'),
      f('Collectives', 'RCCL provides multi-GPU collectives.'),
    ],
    [['ROCm licences', OS.rocm]],
    'Not all of it is open: a profiler decoder and the AOCC optimisations are binary-only. The main repository was archived in October 2026 and its work moved.',
  ),

  // Network
  sonic: d(
    facts('Apache-2.0 (sonic-buildimage)', OSI, 'Linux Foundation (read only from a search snippet)', null),
    'An open network operating system that runs on switches from many vendors and chips, used in large data centers and now offered by Cisco and NVIDIA in their own builds.',
    [
      f('Vendor-neutral', 'One software stack across several switch ASICs.'),
      f('Containerised services', 'Network functions run as containers on the switch.'),
      f('Open build', 'The image is built from the open sonic-buildimage repository.'),
      f('EVPN-VXLAN', 'Supported per an older design document.'),
    ],
    [['SONiC Foundation', OS.sonic]],
    'The Linux Foundation hosting was confirmed only from a search snippet. Cisco Silicon One is not on its build list, and RoCE support for AI fabrics was not confirmed.',
  ),
  cilium: d(
    facts('Apache-2.0', OSI, 'CNCF Graduated project; Isovalent, now part of Cisco, built it', 'v1.20.3'),
    'Kubernetes networking, network policy and observability built on eBPF, with Hubble for visibility into service traffic. It is the open core of Cisco\'s Isovalent Networking.',
    [
      f('eBPF data path', 'Enforces policy in the kernel without changing applications.'),
      f('Hubble', 'A service dependency map and flow visibility.'),
      f('L4 and L7 policy', 'Policies on network and application protocols, including DNS.'),
      f('Open core of a product', 'The enterprise edition adds support and features that are not in the open source.'),
    ],
    [['Cilium on CNCF', OS.cilium], ['Cilium documentation', 'https://docs.cilium.io/en/stable/overview/intro/']],
    'Needs Linux kernel 5.10 or later (4.18 on RHEL 8.10), on AMD64 or AArch64 only.',
  ),
  calico: d(
    facts('Apache-2.0 (not rechecked)', OPEN_VENDOR, 'Created and maintained by Tigera; not a CNCF project', null),
    'Kubernetes networking and network policy from Tigera, with a choice of eBPF, standard Linux, Windows or VPP data planes, WireGuard encryption and BGP.',
    [
      f('Data plane choice', 'eBPF, standard Linux, Windows or VPP.'),
      f('Network policy', 'Kubernetes policy plus its own extended policies.'),
      f('Encryption', 'WireGuard encryption between nodes.'),
      f('BGP and VXLAN', 'Routing and overlay options.'),
    ],
    [['Calico repository', OS.calico], ['Calico documentation', 'https://docs.tigera.io/calico/latest/about']],
    'Several features in the documentation are Cloud or Enterprise only, so not everything listed is in the open edition. Its licence was not rechecked in this pass.',
  ),
  nccl: d(
    facts('Mostly Apache-2.0, with some BSD parts', OPEN_VENDOR, 'Controlled by NVIDIA', null),
    'NVIDIA\'s library for communication between GPUs: all-reduce, all-gather, broadcast and point-to-point, over NVLink, PCIe, InfiniBand and IP sockets.',
    [
      f('Collectives', 'All-reduce, all-gather, reduce-scatter and all-to-all.'),
      f('Topology-aware', 'Chooses rings and trees that match the interconnect.'),
      f('Many transports', 'NVLink, PCIe, InfiniBand verbs and sockets.'),
      f('CUDA graph capture', 'Supported from version 2.9.'),
    ],
    [['NCCL repository', OS.nccl], ['NCCL user guide', 'https://docs.nvidia.com/deeplearning/nccl/user-guide/docs/overview.html']],
    'Open, but it runs on NVIDIA GPUs only. With CUDA graphs, using multiple GPUs in one process can deadlock; one GPU per process is recommended.',
  ),
  rccl: d(
    facts('BSD-3-style', OPEN_VENDOR, 'Controlled by AMD', null),
    'AMD\'s collective-communication library, API-compatible with NCCL, for multi-GPU and multi-node jobs over PCIe, xGMI and InfiniBand.',
    [
      f('NCCL-compatible API', 'Framework code written for NCCL runs on it.'),
      f('Collectives', 'All-reduce, all-gather, reduce-scatter and all-to-all.'),
      f('Plugins', 'Tuner and network plugins.'),
      f('Rings and trees', 'The same family of algorithms as NCCL.'),
    ],
    [['RCCL repository', OS.rccl]],
    'The ROCm/rccl repository is retired and development moved to ROCm/rocm-systems. It needs AMD GPUs and the ROCm stack.',
  ),
  'uec-specs': d(
    [
      ['Licence', 'Not stated on the pages read'],
      ['Class', 'A specification, not software'],
      ['Governance', 'Ultra Ethernet Consortium, a Linux Foundation project'],
      ['Latest release', `Specification 1.1, 12 October 2026 (${AS_OF})`],
    ],
    'The Ultra Ethernet Consortium\'s specification for an Ethernet transport for AI and HPC networks, including a new transport protocol and congestion control.',
    [
      f('Ultra Ethernet Transport', 'A transport designed for AI and HPC flows over Ethernet.'),
      f('Multi-path delivery', 'Spreads one flow across many paths.'),
      f('Congestion control', 'Control tuned for large synchronised flows.'),
      f('Published specification', 'Version 1.1 was published in October 2026.'),
    ],
    [['UEC specification', OS.uec]],
    'A specification is not a shipping, interoperable product. The licence and patent terms were not stated on the pages read.',
  ),

  // Data
  milvus: d(
    facts('Apache-2.0', OSI, 'LF AI & Data Graduated project; Zilliz is the major contributor', 'pymilvus 3.0.2'),
    'A vector database for similarity search, written in Go and C++, with a distributed Kubernetes-native design, GPU acceleration and a lightweight embedded mode.',
    [
      f('Distributed architecture', 'Scales out on Kubernetes.'),
      f('GPU acceleration', 'Builds and searches indexes on GPUs.'),
      f('Streaming updates', 'Newly added data is searchable in real time.'),
      f('Standalone and Lite', 'Runs as a single node or embedded in Python.'),
    ],
    [['LF AI & Data projects', OS.milvus]],
    'Zilliz leads the project and the README steers users to its commercial cloud service. No functional limit was verified because the project\'s documentation site could not be read.',
  ),
  qdrant: d(
    facts('Apache-2.0', OSI, 'Controlled by Qdrant, which sells Qdrant Cloud', 'v1.19.2'),
    'A vector database written in Rust, with filtering on payload data, quantisation and distributed deployment.',
    [
      f('Payload filtering', 'Combines vector search with attribute filters.'),
      f('Quantisation', 'Reduces memory use for large collections.'),
      f('Distributed mode', 'Shards and replicates collections.'),
      f('Written in Rust', 'A single binary service.'),
    ],
    [['Qdrant repository', OS.qdrant]],
    'Single-vendor project; this pass did not read its documentation, so features rest on the repository description.',
  ),
  pgvector: d(
    facts('PostgreSQL licence', OSI, 'Maintained as an open extension to Postgres', 'v0.8.7'),
    'Vector similarity search as a Postgres extension, so embeddings live beside the rest of the data in an existing database.',
    [
      f('Inside Postgres', 'Vectors are a column type with SQL queries.'),
      f('Exact and approximate search', 'Supports exact search and approximate indexes.'),
      f('Transactions', 'Gets Postgres ACID guarantees and tooling.'),
      f('Several distance measures', 'L2, inner product and cosine.'),
    ],
    [['pgvector repository', OS.pgvector]],
    'It suits small and medium corpora. It is an extension, not a purpose-built vector database.',
  ),
  ceph: d(
    facts('LGPL 2.1/3.0, with some GPL headers, BSD and public domain files', OSI, 'Ceph Foundation, a Linux Foundation directed fund; Rook (CNCF Graduated) runs it on Kubernetes', 'Tentacle 20.2.4'),
    'Unified storage on ordinary servers: block (RBD), file (CephFS) and object (RGW), with data placement by CRUSH and no single point of failure.',
    [
      f('Block, file and object', 'One system serves all three.'),
      f('CRUSH placement', 'Distributes and recovers data without a central lookup.'),
      f('Kubernetes through Rook', 'Runs and manages Ceph as a Kubernetes service with a CSI driver.'),
      f('cephadm', 'Deploys and upgrades a cluster.'),
    ],
    [['Ceph Foundation', OS.ceph], ['Ceph releases', 'https://docs.ceph.com/en/latest/releases/']],
    'Only two releases are maintained at a time (Tentacle and Squid); Squid is estimated to reach end of life on 31 October 2026. It has no GPUDirect Storage certification or vendor service level.',
  ),
  minio: d(
    facts('AGPL-3.0', 'OSI-approved, but archived', 'Controlled by MinIO, Inc.; repository archived 25 April 2026', 'None: "no longer maintained"'),
    'An S3-compatible object store that was widely used for AI data. Its repository is now archived and the vendor points to a commercial successor, so it is here as a caution.',
    [
      f('S3 compatibility', 'Speaks the S3 API for AI and analytics pipelines.'),
      f('Embedded console', 'A web console shipped with the server.'),
      f('Source only', 'The community edition is source-only, with no new binaries.'),
      f('Commercial successor', 'AIStor has free and enterprise editions.'),
    ],
    [['MinIO repository', OS.minio]],
    'The repository says "THIS REPOSITORY IS NO LONGER MAINTAINED". Existing binaries get no updates, and AGPL obligations apply. Several vendor designs still name MinIO.',
  ),
  lustre: d(
    facts('GPL-2.0 with a syscall exception', OSI, 'OpenSFS and EOFS hold the trademark', '2.17.0, 29 December 2025'),
    'A parallel file system for HPC with a POSIX interface, scaling to thousands of clients and petabytes, used on national-laboratory supercomputers.',
    [
      f('POSIX interface', 'Applications see an ordinary file system.'),
      f('Separate metadata and data', 'Metadata servers and object storage servers scale independently.'),
      f('Very high throughput', 'Built for leadership-class HPC.'),
      f('Long record in HPC', 'In use on national-laboratory systems.'),
    ],
    [['Lustre', OS.lustre], ['Lustre manual', 'https://doc.lustre.org/lustre_manual.xhtml']],
    'The file system itself provides no redundancy: RAID is required to survive disk failure. It needs specific kernels, and the project site is thin.',
  ),

  // Ops
  prometheus: d(
    facts('Apache-2.0', OSI, 'CNCF Graduated project', '3.15.1'),
    'A monitoring system that scrapes metrics, stores them in a time-series database, evaluates rules and alerts, with the PromQL query language.',
    [
      f('Pull model', 'Scrapes targets over HTTP, with service discovery.'),
      f('PromQL', 'A query language for time series.'),
      f('Autonomous servers', 'Each server runs without distributed storage.'),
      f('GPU metrics', 'NVIDIA publishes a recipe that scrapes GPU telemetry into it.'),
    ],
    [['Prometheus on CNCF', OS.prometheus], ['Overview', 'https://prometheus.io/docs/introduction/overview/']],
    'Not suited where 100% accuracy is needed, such as per-request billing. It covers metrics, not logs or traces.',
  ),
  grafana: d(
    facts('AGPL-3.0 (Apache-2.0 for some directories)', OPEN_VENDOR, 'Controlled by Grafana Labs; relicensed from Apache-2.0 on 21 April 2021', 'v13.2.4'),
    'Dashboards and alerting over many data sources, including Prometheus. NVIDIA\'s GPU monitoring recipe ends in a Grafana dashboard.',
    [
      f('Many data sources', 'Queries metrics, logs and traces in one dashboard.'),
      f('Template variables', 'Reusable dashboards.'),
      f('Alerting', 'Sends to Slack, PagerDuty and others.'),
      f('Panel plugins', 'Extends visualisations.'),
    ],
    [['Grafana relicensing', OS.grafana]],
    'AGPL-3.0 has obligations if you modify it or offer it as a service. Check the edition for each feature: some are Cloud or Enterprise only.',
  ),
  opentelemetry: d(
    facts('Apache-2.0', OSI, 'CNCF Graduated project (11 May 2026)', 'Collector v0.163.0'),
    'The open standard and collector for traces, metrics and logs, with a vendor-neutral way to receive, process and export telemetry.',
    [
      f('OTLP', 'A stable wire protocol for telemetry.'),
      f('Collector', 'One agent or gateway for many signals and backends.'),
      f('GenAI conventions', 'Semantic conventions for language model calls, in development.'),
      f('Vendor neutral', 'Exports to many backends, including Prometheus and Splunk.'),
    ],
    [['OpenTelemetry on CNCF', OS.otel]],
    'Components have their own stability levels, from development to stable. The GenAI and GPU semantic conventions are at Development status.',
  ),
  'dcgm-exporter': d(
    facts('Apache-2.0', OPEN_VENDOR, 'Controlled by NVIDIA', null),
    'Publishes NVIDIA GPU telemetry from the Data Center GPU Manager in Prometheus format.',
    [
      f('Prometheus format', 'Exposes GPU metrics for scraping.'),
      f('Helm chart', 'Deploys on Kubernetes.'),
      f('Default counters', 'A configurable list of collected metrics.'),
      f('Grafana dashboard', 'A dashboard is provided.'),
    ],
    [['DCGM-Exporter repository', OS.dcgmExporter]],
    'It must run with the DCGM version paired to the exporter release, and works on NVIDIA GPUs only.',
  ),
  mlflow: d(
    facts('Apache-2.0', OSI, 'Linux Foundation project; created and mostly maintained by Databricks', '3.17.2'),
    'A platform for experiment tracking, model management, tracing and evaluation of models, agents and language model applications.',
    [
      f('Tracing', 'Built on OpenTelemetry.'),
      f('Evaluation', 'Scores model and agent quality.'),
      f('Prompt management', 'Versions and optimises prompts.'),
      f('AI Gateway', 'Controls cost and access to models.'),
    ],
    [['MLflow joins the Linux Foundation', OS.mlflow]],
    'No limitation is stated in its README. Its popularity figures are self-reported.',
  ),
  langfuse: d(
    facts('MIT core; the ee directory is proprietary', OPEN_VENDOR, 'Acquired by ClickHouse on 16 January 2026', null),
    'Open-source observability for language model applications: traces, prompt management and evaluation.',
    [
      f('Traces', 'Records requests through chains and agents.'),
      f('Prompt management', 'Versions prompts.'),
      f('Evaluation', 'Scores outputs.'),
      f('Self-hosting', 'Can run on your own infrastructure.'),
    ],
    [['ClickHouse acquires Langfuse', OS.langfuse]],
    'Part of the code is under a proprietary licence. It changed owner in January 2026.',
  ),
  mcp: d(
    facts('Being moved from MIT to Apache-2.0', OSI, 'Agentic AI Foundation, a Linux Foundation fund (9 December 2025); Cisco is a Gold member', 'Specification 2026-07-28'),
    'The protocol agents use to reach tools and data, with clients and servers in many languages.',
    [
      f('Tools and resources', 'A common way to expose tools and data to a model.'),
      f('Client and server SDKs', 'Available in several languages.'),
      f('Foundation governance', 'Moved to a neutral foundation in December 2025.'),
      f('Dated specifications', 'Revisions are named by date.'),
    ],
    [['Agentic AI Foundation', OS.mcp]],
    'The licence is mid-transition, and the protocol is young: expect revisions.',
  ),
  a2a: d(
    facts('Apache-2.0', OSI, 'Linux Foundation project (23 June 2025); a site banner says it joined the Agentic AI Foundation (not verified elsewhere)', 'v1.0.1'),
    'The protocol for agents built on different frameworks to discover each other and work together, complementary to MCP.',
    [
      f('Agent discovery', 'Agents publish what they can do.'),
      f('Long-running tasks', 'Supports collaboration over time.'),
      f('Opaque agents', 'Agents do not expose internal state or tools.'),
      f('SDKs', 'Python, JavaScript, Java, .NET, Go and Rust.'),
    ],
    [['A2A launch', OS.a2a]],
    'It is a protocol, with no runtime or identity infrastructure of its own. No documented limitation was found.',
  ),
  agntcy: d(
    facts('Apache-2.0 for directory, SLIM, OASF and identity', OSI, 'Linux Foundation project (29 July 2025); Cisco holds 3 of 8 technical steering seats', 'Identity component is pre-1.0'),
    'Open infrastructure for agent discovery, identity and messaging. Cisco created it, and it is the open project behind the AGNTCY entry on the Cisco map.',
    [
      f('Agent directory', 'Finds agents by their described abilities.'),
      f('Open agent schema', 'A standard description of an agent.'),
      f('SLIM messaging', 'Secure messaging between agents.'),
      f('Identity', 'Verifiable identity for agents, pre-1.0.'),
    ],
    [['AGNTCY joins the Linux Foundation', OS.agntcy]],
    'Though hosted by the Linux Foundation, Cisco still holds three of the eight steering seats.',
  ),

  // Security
  tetragon: d(
    facts('Mixed by component; the README shows several licence badges', 'Mixed (not resolved)', 'Developed in the Cilium organisation; not a separate CNCF project', null),
    'eBPF-based runtime security observability and enforcement for Kubernetes. It is the open core of Cisco\'s Isovalent Runtime Security.',
    [
      f('Process and file events', 'Observes execution, file and network activity in the kernel.'),
      f('Enforcement', 'Can block or kill on policy.'),
      f('Kubernetes aware', 'Events carry pod and namespace identity.'),
      f('Low overhead', 'Runs in the kernel with eBPF.'),
    ],
    [['Tetragon repository', OS.tetragon]],
    'Its licence varies by component and was not resolved here.',
  ),
  kyverno: d(
    facts('Apache-2.0 (not rechecked)', OSI, 'CNCF Graduated project (16 March 2026); its README still says Incubating', null),
    'A Kubernetes-native policy engine that validates, mutates and generates resources and verifies image signatures.',
    [
      f('Validate and mutate', 'Applies policy at admission and in background scans.'),
      f('Generate resources', 'Creates resources from policy.'),
      f('Image verification', 'Checks container image signatures.'),
      f('Policy library', 'A public set of ready-made policies.'),
    ],
    [['Kyverno on CNCF', OS.kyverno]],
    'It enforces only the policies you define, cannot protect against flaws in Kubernetes itself, and complements rather than replaces RBAC.',
  ),
  opa: d(
    facts('Apache-2.0 (not rechecked)', OSI, 'CNCF Graduated project', null),
    'A general-purpose policy engine. Services ask it for decisions, and policies are written in the Rego language.',
    [
      f('Rego', 'A declarative policy language.'),
      f('REST API and Go SDK', 'Embeds or queries from services.'),
      f('Broad integrations', 'Kubernetes, Terraform, Docker and SSH.'),
      f('Public roadmap', 'Open planning.'),
    ],
    [['OPA on CNCF', OS.opa]],
    'Its creators and several maintainers moved to Apple in 2025, with no change to governance or licence. Rego performance depends on how rules are written.',
  ),
  falco: d(
    facts('Apache-2.0 (not rechecked)', OSI, 'CNCF Graduated project; created by Sysdig', null),
    'Runtime threat detection for containers and hosts. It watches system calls and raises alerts from rules.',
    [
      f('Rule-driven detection', 'An official ruleset plus your own.'),
      f('Container and Kubernetes context', 'Alerts carry workload metadata.'),
      f('Plugins', 'Extend beyond syscalls.'),
      f('Alert export', 'Sends events to SIEM and data lakes.'),
    ],
    [['Falco on CNCF', OS.falco]],
    'The default eBPF probe needs a kernel with BPF ring buffer and BTF (usually 5.8 or later). The kernel-module driver needs full privileges.',
  ),
  spire: d(
    facts('Apache-2.0 (not rechecked)', OSI, 'CNCF Graduated project', null),
    'Workload identity: attests software and issues SPIFFE identities that systems use to trust each other.',
    [
      f('Workload attestation', 'Proves what a workload is.'),
      f('Short-lived identities', 'Issues and rotates certificates.'),
      f('Plugin framework', 'Extensible attestors and stores.'),
      f('Envoy integration', 'Rotates TLS certificates through SDS.'),
    ],
    [['SPIRE on CNCF', OS.spire]],
    'A single SPIRE server is a single point of failure, so large estates need a shared datastore and several servers.',
  ),
  'sigstore-cosign': d(
    facts('Apache-2.0 (not rechecked)', OSI, 'Sigstore, an OpenSSF Graduated project', 'v3.1.4'),
    'Signs and verifies container images and other artifacts, including models, so that a pipeline can check where something came from.',
    [
      f('Signing', 'Signs images and artifacts.'),
      f('Verification', 'Checks signatures before use.'),
      f('Keyless option', 'Signs with short-lived certificates.'),
      f('Policy integration', 'Admission controllers can require signatures.'),
    ],
    [['cosign repository', OS.cosign]],
    'Signing proves origin, not safety: it says nothing about what a signed model does.',
  ),
  'confidential-containers': d(
    facts('Apache-2.0', OSI, 'CNCF Incubating project (8 July 2026)', null),
    'Runs Kubernetes pods inside confidential virtual machines, with attestation and secret release, on Intel TDX, AMD SEV-SNP and IBM Secure Execution.',
    [
      f('Pod in a confidential VM', 'The pod\'s memory is protected from the host.'),
      f('Attestation and key release', 'Secrets are released only to a verified environment.'),
      f('CPU support', 'Intel TDX, AMD SEV-SNP and IBM Secure Execution.'),
      f('GPU support', 'NVIDIA Hopper, Blackwell and RTX PRO 6000 Blackwell Server Edition.'),
    ],
    [['Confidential Containers overview', OS.coco]],
    'It needs specific CPUs and GPUs. NVIDIA hosts the validated reference architecture for GPUs.',
  ),
  'nemo-guardrails': d(
    facts('Apache-2.0', OPEN_VENDOR, 'Controlled by NVIDIA; repository moved to NVIDIA-NeMo/Guardrails', '0.24.1'),
    'A library for adding programmable guardrails to language model applications: input and output checks and dialogue rules.',
    [
      f('Input and output rails', 'Screens prompts and responses.'),
      f('Dialogue rules', 'Constrains what an assistant may discuss.'),
      f('Retrieval and tool rails', 'Checks around retrieval and tool calls.'),
      f('Library, not a service', 'You embed and operate it.'),
    ],
    [['NeMo Guardrails repository', OS.guardrails]],
    'The safety models NVIDIA publishes carry a separate NVIDIA licence from this code. It is pre-1.0.',
  ),
  garak: d(
    facts('Apache-2.0', OPEN_VENDOR, 'Owned by NVIDIA', '0.17.1'),
    'A scanner that probes language models for weaknesses such as prompt injection, data leakage and jailbreaks.',
    [
      f('Probes', 'Many attack types against a model.'),
      f('Detectors', 'Judge whether an attack worked.'),
      f('Many targets', 'Tests hosted and local models.'),
      f('Reports', 'Writes results for review.'),
    ],
    [['garak repository', OS.garak]],
    'It tests models, not whole systems. Results show what was probed, not that a model is safe.',
  ),
};

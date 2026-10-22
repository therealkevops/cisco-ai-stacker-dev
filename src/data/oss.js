// The open-source AI stack as data, in the same shape as the Cisco and NVIDIA lenses.
//
// Everything here was checked in October 2026 against each project's own files and pages: the raw
// LICENSE file for the licence, the hosting foundation's own page for governance, and PyPI, the Go
// module proxy or the project's release page for the latest release. Where a check could not be made,
// the description says so. There is no vendor taxonomy to follow: which primitive a project sits in is
// this app's choice.
//
// A filled hexagon is a project hosted by a foundation or a community body. An open one is released
// under an open licence but controlled by a single company. A dashed one is not under an OSI-approved
// software licence, or its terms are not stated. Open-weight models are not software and are not
// "open source" in OSI's sense, so they are one dashed entry with their licences set out.

import { PRIMITIVES, LINK_TYPES } from './stack.js';
import { OSS_DETAILS, OSS_PRIMITIVE_DETAILS, OSS_PRIMITIVE_SUMMARIES } from './oss-details.js';
import { OSS_USE_CASES } from './usecases-oss.js';
import { OS } from './oss-urls.js';


const oss = (id, name, primitive, url, blurb, extra = {}) => ({ id, name, primitive, vendor: 'oss', status: 'sourced', url, blurb, ...extra });
const ctl = (id, name, primitive, url, blurb, extra = {}) => ({ id, name, primitive, vendor: 'partner', status: 'sourced', url, blurb, ...extra });

const rel = (lens, id, relation, note) => ({ lens, id, relation, note });

const OSS_NODES = [
  // Designs: the published open documents, which are fewer and thinner than the vendors' validated designs.
  { id: 'oss-opea-chatqna', name: 'OPEA ChatQnA', kind: 'design', vendor: 'oss', status: 'sourced', url: OS.opeaChatqna,
    blurb: 'A retrieval-augmented chat pipeline from the Open Platform for Enterprise AI, a Linux Foundation AI & Data sandbox project. A published reference implementation, not a validated design: validated on Gaudi, Xeon, AI PC and AMD ROCm, with NVIDIA GPUs only through Docker Compose.',
    bom: [
      'Microservices for data preparation, embedding, retrieval, optional reranking and the language model, behind one gateway',
      'Hugging Face TEI for embedding and reranking',
      'vLLM or TGI for the language model; the default model is Llama 3 8B Instruct',
      'Redis as the default vector database; Milvus, Qdrant, Mariadb and Pinecone are also validated',
      'Docker Compose, or Helm charts on Kubernetes (validated on Gaudi and Xeon)',
    ],
    offMap: ['Hugging Face Text Embeddings Inference (TEI)', 'Redis, Mariadb and Pinecone', 'Intel Xeon and Gaudi, AI PC and AMD hardware'] },
  { id: 'oss-llm-d-paths', name: 'llm-d well-lit paths', kind: 'design', vendor: 'oss', status: 'sourced', url: OS.llmdDocs,
    blurb: 'Benchmarked serving recipes for large language models on Kubernetes from llm-d, a CNCF sandbox project (version 1.0, October 2026). They cover the inference layer only: no server, network or storage bill of materials.',
    bom: [
      'The llm-d router with prefix-cache and load-aware scoring, in front of vLLM model servers',
      'An Envoy gateway, with the Gateway API Inference Extension CRDs',
      'Prefill and decode disaggregation, tiered KV cache and wide expert parallelism as separate paths',
      'Per-model recipes for DeepSeek, GLM, Nemotron 3 Ultra and Qwen, with Helm and Kustomize overlays per accelerator',
    ],
    offMap: ['Envoy and the Gateway API Inference Extension', 'LeaderWorkerSet', 'Accelerators and RDMA networks: NVIDIA, AMD, Intel and Google TPU are validated'] },
  { id: 'oss-k8s-ai-conformance', name: 'Kubernetes AI Conformance', short: 'AI Conformance', kind: 'design', vendor: 'oss', status: 'sourced', url: OS.aiConformance,
    blurb: 'A CNCF programme, not a design: a checklist (version 1.37) that a Kubernetes platform is certified against, per product and configuration, for one year. It certifies platforms (EKS, GKE, OpenShift, Nutanix NKP and others), not hardware, and has no bill of materials or sizing.',
    bom: [
      'Accelerator and driver management, GPU sharing, and secure accelerator access',
      'Inference through Gateway API, with the Inference Extension and disaggregated inference as options',
      'Gang scheduling (for example Kueue or Volcano), and cluster and pod autoscaling',
      'Accelerator and AI service metrics',
      'Workload sandboxing, and a robust operator',
    ],
    offMap: ['The certified platforms themselves, from EKS to OpenShift', 'Any hardware, network or storage requirement'] },
  { id: 'oss-nvidia-coco', name: 'Confidential Containers reference architecture', short: 'CoCo reference architecture', kind: 'design', vendor: 'oss', status: 'sourced', url: OS.nvidiaCoco,
    blurb: 'NVIDIA\'s validated reference architecture for running GPU AI workloads in confidential containers on Kubernetes, built from CNCF Confidential Containers, Kata Containers and Trustee with NVIDIA\'s GPU Operator. Hosted by NVIDIA, built from upstream parts.',
    bom: [
      'Confidential Containers: each pod runs in a Kata Containers utility VM, with the GPUs passed through',
      'Trustee for attestation and key release, with NVIDIA\'s remote attestation service',
      'NVIDIA GPU Operator (version 26.3.1 or later), setting confidential mode on the GPUs',
      'Hopper, Blackwell and RTX PRO 6000 GPUs, on AMD SEV-SNP or Intel TDX hosts',
      'Kubernetes 1.32 or later with containerd, and Kata Containers 4.0',
    ],
    offMap: ['Kata Containers, QEMU and Trustee', 'Confidential-computing hardware: AMD SEV-SNP and Intel TDX hosts'] },

  // Platform
  oss('kubernetes', 'Kubernetes', 'platform', OS.kubernetes, 'The open container orchestrator under every design on the other maps. Upstream Kubernetes is not a distribution: OpenShift, Nutanix NKP and Rancher add installation, lifecycle and support.',
    { alsoIn: [rel('cisco', 'kubernetes', 'The open core of', 'Cisco\'s designs list upstream Kubernetes as a supported option beside OpenShift and Nutanix NKP.'), rel('nvidia', 'k8s-platforms', 'The open core of', 'NVIDIA AI Enterprise\'s support matrix lists upstream Kubernetes among the platforms.')] }),
  oss('kserve', 'KServe', 'platform', OS.kserve, 'Kubernetes-native model serving: a custom resource for inference services, with vLLM and llm-d backends and autoscaling.',
    { alsoIn: [rel('nvidia', 'nim', 'An open alternative to the deployment layer of', 'KServe manages and routes model servers; it is not an inference engine and has no NVIDIA-optimised engines or support, so it is not like-for-like with NIM.')] }),
  oss('vllm', 'vLLM', 'platform', OS.vllm, 'High-throughput language model inference engine with an OpenAI-compatible server, running on NVIDIA, AMD and Intel accelerators.',
    { alsoIn: [rel('nvidia', 'tensorrt-llm-triton', 'An open alternative to', 'Not like-for-like: there is no NVIDIA-supported, certified container.')] }),
  oss('sglang', 'SGLang', 'platform', OS.sglang, 'Inference framework for language, vision-language and diffusion models, tuned for agentic workloads and large-scale serving.'),
  oss('ray', 'Ray', 'platform', OS.ray, 'Distributed runtime and libraries (Data, Train, Tune, RLlib, Serve) for scaling AI and Python applications, hosted by the PyTorch Foundation.'),
  oss('kubeflow', 'Kubeflow', 'platform', OS.kubeflow, 'The Kubernetes-native AI platform: Pipelines, Trainer, Katib and notebooks as separately versioned projects. CNCF Graduated since July 2026.'),
  oss('llm-d', 'llm-d', 'platform', OS.llmd, 'Distributed inference serving on Kubernetes, with prefix-cache-aware routing and prefill and decode disaggregation above vLLM and SGLang. CNCF sandbox; version 1.0 in October 2026.',
    { alsoIn: [rel('nvidia', 'dynamo', 'The closest open alternative to', 'Not identical: Dynamo has its own runtime and transfer library, while llm-d composes vLLM and the Kubernetes Gateway API. NVIDIA is one of llm-d\'s founders.')] }),
  oss('kagent', 'kagent', 'platform', OS.kagent, 'Declarative agents on Kubernetes, with MCP tool servers, and a controller that exposes gRPC, A2A and MCP APIs. A CNCF sandbox project, pre-1.0.'),
  ctl('open-weight-models', 'Open-weight models', 'platform', OS.modelLicences, 'The main open-weight model families, with the licence each actually carries. Weights are not software, and none is OSI-certified as open-source AI, so they are "open-weight" here, and mixed: some Apache-2.0, some custom.',
    { dashed: true, short: 'Open-weight models',
      alsoIn: [rel('nvidia', 'nim', 'Includes the open models served by', 'Nemotron, Llama and other open-weight models are what NIM microservices package; the NIM container carries separate NVIDIA terms.'), rel('cisco', 'foundation-ai', 'Is an example of', 'Foundation-sec is open-weight, built on Llama 3.1, and ships both the Apache and the Llama licences.')] }),

  // Compute
  oss('pytorch', 'PyTorch', 'compute', OS.pytorch, 'The tensor and deep-learning framework under most training and inference. Hosted by the PyTorch Foundation with vLLM and Ray.'),
  ctl('slurm', 'Slurm', 'compute', OS.slurm, 'The job scheduler for HPC and AI clusters. NVIDIA acquired its developer SchedMD in December 2025 and pledged to keep it open source and vendor-neutral.',
    { alsoIn: [rel('nvidia', 'base-command-manager', 'Is used with', 'NVIDIA\'s reference architectures deploy Base Command Manager, Slurm and Kubernetes together.')] }),
  oss('kai-scheduler', 'KAI Scheduler', 'compute', OS.kai, 'A Kubernetes scheduler for AI workloads, with gang scheduling, topology awareness and fractional GPUs. A CNCF sandbox project that began at NVIDIA (Run:ai).',
    { alsoIn: [rel('nvidia', 'run-ai', 'The open scheduler core of', 'Not like-for-like: Run:ai the product adds a control plane, quotas, a UI and NVIDIA support.')] }),
  oss('volcano', 'Volcano', 'compute', OS.volcano, 'A batch and gang scheduler for Kubernetes, for AI, machine learning, HPC and big data. CNCF Incubating.'),
  oss('kueue', 'Kueue', 'compute', OS.kueue, 'Job queueing and quota for Kubernetes: queues, fair sharing, cohorts and preemption. A Kubernetes SIG project.'),
  ctl('gpu-operator', 'NVIDIA GPU Operator', 'compute', OS.gpuOperator, 'Installs and manages NVIDIA\'s GPU software on Kubernetes. The operator is Apache-2.0 and NVIDIA-controlled; the driver stack it deploys is NVIDIA\'s.',
    { short: 'GPU Operator', alsoIn: [rel('nvidia', 'k8s-operators', 'The open repository of', 'The GPU Operator is one of the operators in that entry.')] }),
  ctl('rocm', 'ROCm', 'compute', OS.rocm, 'AMD\'s GPU software stack, licensed per component, mostly MIT. Not all of it is open: a profiler decoder and the AOCC optimisations are binary-only. AMD GPUs only.'),

  // Network
  oss('sonic', 'SONiC', 'network', OS.sonic, 'An open network operating system for switches from many vendors and ASICs, hosted by the Linux Foundation. Cisco and NVIDIA ship their own SONiC builds.'),
  oss('cilium', 'Cilium', 'network', OS.cilium, 'Kubernetes networking and network policy built on eBPF. CNCF Graduated. It is the open core of Cisco\'s Isovalent Networking.',
    { alsoIn: [rel('cisco', 'isovalent', 'The open core of', 'Isovalent, now part of Cisco, built Cilium; the enterprise product adds support and features that are not in the open source.')] }),
  ctl('calico', 'Calico', 'network', OS.calico, 'Kubernetes networking and network policy, created and maintained by Tigera. Not a CNCF project.'),
  ctl('nccl', 'NCCL', 'network', OS.nccl, 'NVIDIA\'s collective-communication library for multi-GPU jobs. Open, but it runs on NVIDIA\'s CUDA, NVLink and ConnectX.',
    { alsoIn: [rel('nvidia', 'nvlink', 'Runs over', 'NCCL is the library that moves data across NVLink and the network between NVIDIA GPUs.')] }),
  ctl('rccl', 'RCCL', 'network', OS.rccl, 'AMD\'s collective-communication library, API-compatible with NCCL and for AMD GPUs.'),
  oss('uec-specs', 'Ultra Ethernet specification', 'network', OS.uec, 'The Ultra Ethernet Consortium\'s specification for an AI and HPC Ethernet transport, version 1.1 published 12 October 2026. A specification, not software, and its licence and IP terms are not stated on the pages read.',
    { dashed: true, short: 'Ultra Ethernet spec' }),

  // Data
  oss('milvus', 'Milvus', 'data', OS.milvus, 'A vector database, an LF AI & Data Graduated project led by Zilliz. It is the vector store inside Cisco\'s and NVIDIA\'s RAG designs.',
    { alsoIn: [rel('cisco', 'flexpod-rag', 'Used inside', 'The FlexPod RAG design deploys Milvus with a GPU index, and the FlashStack one does too.'), rel('cisco', 'flashstack-rag', 'Used inside', 'FlashStack\'s Milvus search on one L40S measured about 13,200 queries a second.'), rel('nvidia', 'era-rag', 'Used inside', 'NVIDIA\'s RAG deployment guide uses Milvus with cuVS to build GPU indexes. Milvus is not cuVS, and it is not NeMo Retriever.')] }),
  ctl('qdrant', 'Qdrant', 'data', OS.qdrant, 'A vector database in Rust, from Qdrant, which also sells Qdrant Cloud. An alternative to Milvus.'),
  oss('pgvector', 'pgvector', 'data', OS.pgvector, 'Vector similarity search as a Postgres extension. Suits small and medium corpora; it is an extension, not a database.'),
  oss('ceph', 'Ceph', 'data', OS.ceph, 'Open storage for block, file and object data, hosted by the Ceph Foundation, with Rook (CNCF Graduated) to run it on Kubernetes. Cisco\'s Secure AI Factory case study uses CephFS.',
    { alsoIn: [rel('cisco', 'secure-ai-factory', 'Is used in the case study of', 'The Cisco case study names CephFS as shared storage; Ceph has no GPUDirect Storage certification or vendor service level.')] }),
  ctl('minio', 'MinIO', 'data', OS.minio, 'An S3-compatible object store, now archived: its repository says it is no longer maintained. Included as a warning about open-source licence and maintenance changes.'),
  oss('lustre', 'Lustre', 'data', OS.lustre, 'An open parallel file system for HPC, with its trademark held by OpenSFS and EOFS. It needs specific kernels.'),

  // Operations and agents
  oss('prometheus', 'Prometheus', 'ops', OS.prometheus, 'The metrics database and alerting system. CNCF Graduated. NVIDIA publishes the recipe that scrapes GPU metrics into it.',
    { alsoIn: [rel('cisco', 'splunk-obs', 'An open alternative for the metrics side of', 'Not like-for-like: Splunk Observability adds logs, traces, AI infrastructure monitoring and security analytics.')] }),
  ctl('grafana', 'Grafana', 'ops', OS.grafana, 'Dashboards over many data sources. Licensed AGPL-3.0 since April 2021, having been Apache-2.0, and controlled by Grafana Labs.',
    { alsoIn: [rel('nvidia', 'mission-control', 'Is used in', 'Mission Control ships Grafana dashboards.')] }),
  oss('opentelemetry', 'OpenTelemetry', 'ops', OS.otel, 'The open standard and collector for traces, metrics and logs. CNCF Graduated since May 2026. Its GenAI and GPU conventions are still in development.',
    { alsoIn: [rel('cisco', 'splunk-obs', 'Is the base of the collector in', 'Splunk\'s AI POD monitoring needs the Splunk distribution of the OpenTelemetry Collector.')] }),
  ctl('dcgm-exporter', 'DCGM-Exporter', 'ops', OS.dcgmExporter, 'Publishes NVIDIA GPU metrics in Prometheus format. Apache-2.0 and NVIDIA-controlled.',
    { short: 'DCGM-Exporter', alsoIn: [rel('nvidia', 'dcgm', 'The Prometheus exporter for', 'DCGM itself is a separate NVIDIA library, and its licence was not checked.')] }),
  oss('mlflow', 'MLflow', 'ops', OS.mlflow, 'Experiment tracking and model management, a Linux Foundation project created and mostly maintained by Databricks.'),
  ctl('langfuse', 'Langfuse', 'ops', OS.langfuse, 'Open-source LLM observability. MIT for its core, with an enterprise directory under a proprietary licence. ClickHouse acquired it in January 2026.'),
  oss('mcp', 'Model Context Protocol', 'ops', OS.mcp, 'The protocol agents use to reach tools and data, hosted by the Linux Foundation\'s Agentic AI Foundation. The specification revision is 2026-07-28.',
    { short: 'MCP', alsoIn: [rel('nvidia', 'nemo-agent-toolkit', 'Is supported by', 'The NeMo Agent Toolkit includes an MCP client and an MCP server.')] }),
  oss('a2a', 'Agent2Agent protocol', 'ops', OS.a2a, 'The protocol for agents to talk to each other, a Linux Foundation project. Version 1.0 in 2026; it complements MCP.',
    { short: 'A2A' }),
  oss('agntcy', 'AGNTCY', 'ops', OS.agntcy, 'Open infrastructure for agent discovery, identity and messaging, a Linux Foundation project that Cisco created and still dominates.',
    { alsoIn: [rel('cisco', 'agntcy', 'Is', 'This is the open project behind that entry. Cisco holds three of the eight technical steering seats.')] }),

  // Security
  oss('tetragon', 'Tetragon', 'security', OS.tetragon, 'eBPF runtime security observability and enforcement for Kubernetes, developed in the Cilium organisation. It is the open core of Cisco\'s Isovalent Runtime Security.',
    { alsoIn: [rel('cisco', 'isovalent-runtime', 'The open core of', 'Not a separate CNCF project, and its licence varies by component.')] }),
  oss('kyverno', 'Kyverno', 'security', OS.kyverno, 'A policy engine for Kubernetes. CNCF Graduated in March 2026, although its own README still says Incubating.'),
  oss('opa', 'Open Policy Agent', 'security', OS.opa, 'A general-purpose policy engine, CNCF Graduated. Its creators and many maintainers moved to Apple in 2025, with no change to governance or licence.',
    { short: 'Open Policy Agent' }),
  oss('falco', 'Falco', 'security', OS.falco, 'Runtime threat detection for containers and hosts, created by Sysdig. CNCF Graduated.'),
  oss('spire', 'SPIFFE and SPIRE', 'security', OS.spire, 'Workload identity: APIs and a toolchain for establishing trust between software systems. CNCF Graduated.'),
  oss('sigstore-cosign', 'Sigstore cosign', 'security', OS.cosign, 'Signs container images and artifacts, including models. Sigstore is an OpenSSF Graduated project.',
    { short: 'cosign' }),
  oss('confidential-containers', 'Confidential Containers', 'security', OS.coco, 'Runs pods inside confidential VMs with attestation and secret release, on Intel TDX, AMD SEV-SNP and IBM Secure Execution, with NVIDIA GPUs supported. CNCF Incubating since July 2026.',
    { short: 'Confidential Containers', alsoIn: [rel('nvidia', 'confidential-computing', 'The open framework NVIDIA builds on in', 'NVIDIA\'s confidential-containers reference architecture is built on it.')] }),
  ctl('nemo-guardrails', 'NeMo Guardrails', 'security', OS.guardrails, 'A programmable guardrails library for language model applications. Apache-2.0 and NVIDIA-controlled.',
    { alsoIn: [rel('nvidia', 'nemo-guardrails', 'The open repository of', 'The models in the safety-models entry carry a separate NVIDIA licence from this code.'), rel('cisco', 'ai-defense', 'Is not like-for-like with', 'A library with rails is not Cisco\'s managed inspection, although Cisco AI Defense integrates with it.')] }),
  ctl('garak', 'garak', 'security', OS.garak, 'A scanner that probes language models for vulnerabilities such as prompt injection and data leakage. Apache-2.0 and now NVIDIA-owned.'),
];

const L = (a, b, type, label, status = 'sourced') => ({ a, b, type, label, status });

const OSS_LINKS = [
  // Designs
  L('oss-opea-chatqna', 'vllm', 'composes', 'vLLM is one of the two language model servers; the Xeon compose file uses a vLLM CPU image'),
  L('oss-opea-chatqna', 'milvus', 'composes', 'A validated alternative vector database; the default is Redis, which is not on this map'),
  L('oss-opea-chatqna', 'qdrant', 'composes', 'Another validated alternative vector database'),
  L('oss-opea-chatqna', 'open-weight-models', 'composes', 'The default model is Llama 3 8B Instruct, which needs the Hugging Face licence to be accepted'),
  L('oss-opea-chatqna', 'kubernetes', 'composes', 'Helm charts deploy it on Kubernetes, validated on Gaudi and Xeon'),
  L('oss-llm-d-paths', 'llm-d', 'composes', 'The router and the recipes'),
  L('oss-llm-d-paths', 'vllm', 'composes', 'The primary model server'),
  L('oss-llm-d-paths', 'sglang', 'composes', 'Also supported as a model server'),
  L('oss-llm-d-paths', 'kubernetes', 'composes', 'Deployed with Helm and Kustomize'),
  L('oss-k8s-ai-conformance', 'kubernetes', 'composes', 'A platform must first pass base Kubernetes conformance'),
  L('oss-k8s-ai-conformance', 'kueue', 'composes', 'Named as an example of gang scheduling, which is required'),
  L('oss-k8s-ai-conformance', 'volcano', 'composes', 'Also named as an example of gang scheduling'),
  L('oss-k8s-ai-conformance', 'llm-d', 'composes', 'Named as an example for disaggregated inference, which is optional'),
  L('oss-nvidia-coco', 'confidential-containers', 'composes', 'The framework the architecture deploys'),
  L('oss-nvidia-coco', 'gpu-operator', 'composes', 'Sets confidential mode on the GPUs and advertises them to pods'),
  L('oss-nvidia-coco', 'kubernetes', 'composes', 'Kubernetes 1.32 or later'),

  // Platform and runtime
  L('kserve', 'kubernetes', 'runs', 'A Kubernetes-native platform'),
  L('kserve', 'vllm', 'composes', 'vLLM is a backend for language models'),
  L('kserve', 'llm-d', 'composes', 'llm-d is a backend for distributed serving'),
  L('llm-d', 'kubernetes', 'runs', 'Orchestrates model servers on Kubernetes'),
  L('llm-d', 'vllm', 'composes', 'Sits above vLLM'),
  L('llm-d', 'sglang', 'composes', 'And above SGLang'),
  L('kubeflow', 'kubernetes', 'runs', 'The Kubernetes-native stack for data and AI'),
  L('kagent', 'kubernetes', 'runs', 'Declarative agents run on Kubernetes'),
  L('mcp', 'kagent', 'feeds', 'Agents consume MCP tool servers, and the controller exposes an MCP API'),
  L('a2a', 'kagent', 'feeds', 'The controller exposes an A2A API'),
  L('open-weight-models', 'vllm', 'runs', 'Model cards list vLLM among the servers that run them'),
  L('milvus', 'vllm', 'feeds', 'Milvus\'s own tutorial retrieves with Milvus and generates with vLLM (a vendor tutorial)'),

  // Compute
  L('kueue', 'kubernetes', 'runs', 'A Kubernetes SIG project'),
  L('kueue', 'ray', 'manages', 'Queues RayJob and RayCluster'),
  L('kueue', 'kubeflow', 'manages', 'Queues Kubeflow training jobs; the TrainJob integration is alpha'),
  L('volcano', 'kubernetes', 'runs', 'A batch scheduler that extends kube-scheduler'),
  L('kai-scheduler', 'kubernetes', 'runs', 'A Kubernetes scheduler for AI workloads'),
  L('gpu-operator', 'kubernetes', 'runs', 'Runs as an operator on Kubernetes'),
  L('gpu-operator', 'dcgm-exporter', 'composes', 'Deploys NVIDIA\'s GPU monitoring, which the exporter publishes'),
  L('slurm', 'kubernetes', 'runs', 'Slinky runs Slurm on Kubernetes; Slinky is a separate Apache-2.0 project'),
  L('rocm', 'rccl', 'composes', 'RCCL is a ROCm component'),
  L('pytorch', 'rocm', 'runs', 'ROCm is built and released with nightly PyTorch builds'),

  // Network
  L('cilium', 'kubernetes', 'runs', 'The Kubernetes network layer'),
  L('cilium', 'tetragon', 'composes', 'Tetragon is a Cilium component'),
  L('calico', 'kubernetes', 'runs', 'The Kubernetes network layer'),

  // Data
  L('ceph', 'kubernetes', 'runs', 'Rook, a separate CNCF Graduated project, runs Ceph on Kubernetes'),

  // Operations and agents
  L('dcgm-exporter', 'prometheus', 'feeds', 'Publishes GPU metrics in Prometheus format'),
  L('prometheus', 'grafana', 'feeds', 'NVIDIA\'s GPU telemetry recipe draws a Grafana dashboard from Prometheus'),
  L('opentelemetry', 'mcp', 'observes', 'The GenAI conventions, in development, also cover MCP'),
  L('agntcy', 'mcp', 'secures', 'Provides identity for agents and MCP servers'),

  // Security
  L('kyverno', 'kubernetes', 'secures', 'A policy engine for Kubernetes'),
  L('confidential-containers', 'kubernetes', 'runs', 'Pods run inside confidential VMs'),
  L('gpu-operator', 'confidential-containers', 'manages', 'In NVIDIA\'s reference architecture the GPU Operator sets confidential mode on the GPUs the pods use'),
  L('nemo-guardrails', 'open-weight-models', 'secures', 'Screens the inputs and outputs of language models'),
  L('garak', 'open-weight-models', 'observes', 'Probes language models for vulnerabilities'),
];

export const OSS = {
  id: 'oss',
  name: 'Open source',
  focus: 'oss',
  title: 'The Open-Source AI Stack',
  designsHeading: 'Published open designs and programmes',
  keyCorner: 'top-left',
  ownLabel: 'Foundation or community project',
  otherLabel: 'Open licence, controlled by one company',
  dashedLabel: 'Not OSI open source, or terms not stated',
  dashedMeans: 'not an OSI-approved software licence, or terms not stated',
  primitives: PRIMITIVES.map((p) => ({ ...p, ...OSS_PRIMITIVE_SUMMARIES[p.id] })),
  nodes: OSS_NODES,
  links: OSS_LINKS,
  linkTypes: LINK_TYPES,
  cases: OSS_USE_CASES,
  details: OSS_DETAILS,
  primitiveDetails: OSS_PRIMITIVE_DETAILS,
};

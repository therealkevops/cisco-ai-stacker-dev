// The same customer scenarios as usecases.js, built from open-source projects. There are seven, not
// eight: AI-assisted security operations is left out because no open-source project or published
// design covers it. Open source publishes far fewer end-to-end designs than the vendors, so most of
// these are assemblies: a list of projects, each documented separately, with no published document
// that validates them together. Those are drafts and list no design.

import { OS } from './oss-urls.js';

export const OSS_USE_CASES = [
  {
    id: 'enterprise-rag',
    name: 'Enterprise RAG assistant',
    status: 'draft',
    url: OS.opeaChatqna,
    summary:
      'Answer questions from the company\'s own documents with a retrieval-augmented generation pipeline built from open projects: a vector database, an embedding model and a language model served by vLLM, running on Kubernetes the company controls.',
    caveat: 'OPEA ChatQnA is a published reference implementation, not a validated design: it is validated mainly on Intel Gaudi and Xeon hardware, its default vector database is Redis (not on this map), and its NVIDIA path is Docker Compose only. No published design covers the Kubernetes, GPU and storage layers around it, so treat the rest as an assembly you test yourself. The open-weight model carries its own licence.',
    designs: ['oss-opea-chatqna'],
    refs: [
      ['OPEA ChatQnA example', 'https://github.com/opea-project/GenAIExamples/tree/main/ChatQnA'],
      ['Milvus documentation', 'https://milvus.io/docs'],
      ['vLLM documentation', 'https://docs.vllm.ai/'],
    ],
    offMap: [
      { name: 'Hugging Face TEI and TGI', note: 'The embedding and reranking server, and the alternative model server.' },
      { name: 'Redis', note: 'The default vector database in ChatQnA.' },
      { name: 'Document extraction', note: 'Parsing tables, charts and scans is not covered by any project on this map.' },
    ],
    questions: [
      'Which model licence applies to your use, and does it restrict commercial or hosted use?',
      'Who owns patching and version compatibility across the serving engine, the database and the model?',
      'Is the validation of ChatQnA on your GPU model, or only on Intel hardware?',
    ],
    needs: [
      { products: ['kubernetes'], role: 'required', why: 'ChatQnA is deployed with Helm charts on Kubernetes, validated on Gaudi and Xeon.' },
      { products: ['vllm', 'sglang'], role: 'required', why: 'The language model server; ChatQnA uses vLLM or TGI.' },
      { products: ['milvus', 'qdrant', 'pgvector'], role: 'required', why: 'The vector store. ChatQnA validates Milvus and Qdrant as alternatives to its Redis default.' },
      { products: ['open-weight-models'], role: 'required', why: 'The language and embedding models. ChatQnA\'s default is Llama 3 8B Instruct, under the Llama licence.' },
      { products: ['kserve'], role: 'recommended', why: 'Serving custom resources and autoscaling; ChatQnA itself does not use it.' },
      { products: ['nemo-guardrails'], role: 'recommended', why: 'A library for input and output checks; OPEA has its own guardrail service, so this is an alternative.' },
      { products: ['prometheus'], role: 'recommended', why: 'Metrics for the serving pods and the vector database.' },
      { products: ['kyverno'], role: 'recommended', why: 'Admission policy for the namespace; not part of ChatQnA.' },
    ],
  },
  {
    id: 'enterprise-ai-cluster',
    name: 'GPU cluster for enterprise AI',
    status: 'draft',
    url: OS.aiConformance,
    summary:
      'A dedicated GPU cluster for in-house inference and fine-tuning: Kubernetes with a GPU operator, a gang scheduler with queues, collective communication libraries and shared storage.',
    caveat: 'There is no published open design for this: the CNCF Kubernetes AI Conformance programme certifies a software platform against a checklist and says nothing about servers, networks or storage. The software layer is well documented, but the hardware and fabric are thin: SONiC lists no Cisco Silicon One support and its RoCE support was not confirmed, and the Ultra Ethernet specification is not yet a product. Reference sizing is not available.',
    designs: [],
    refs: [
      ['Kubernetes AI Conformance', 'https://github.com/cncf/k8s-ai-conformance'],
      ['Kueue overview', 'https://kueue.sigs.k8s.io/docs/overview/'],
      ['NVIDIA GPU Operator', 'https://docs.nvidia.com/datacenter/cloud-native/gpu-operator/latest/index.html'],
    ],
    offMap: [
      { name: 'Servers and GPUs', note: 'The hardware itself, which no open project supplies.' },
      { name: 'A Kubernetes distribution', note: 'Upstream Kubernetes is not a distribution; the certified platforms are products.' },
      { name: 'The network adapters and switches', note: 'SONiC runs on some switch ASICs; the adapter and ASIC choice decides RoCE support.' },
    ],
    questions: [
      'Which Kubernetes distribution is certified for AI conformance, and on which version?',
      'Which switches and adapters has the SONiC build been validated with for lossless Ethernet?',
      'Who supports the driver stack, the scheduler and the collective libraries when they fail together?',
    ],
    needs: [
      { products: ['kubernetes'], role: 'required', why: 'The base platform; AI conformance builds on Kubernetes conformance.' },
      { products: ['gpu-operator', 'rocm'], role: 'required', why: 'Exposes the GPUs to Kubernetes; the NVIDIA operator or AMD\'s stack, depending on the hardware.' },
      { products: ['kai-scheduler', 'volcano', 'kueue'], role: 'required', why: 'Gang scheduling is required by AI conformance; Kueue and Volcano are the examples it names.' },
      { products: ['pytorch'], role: 'required', why: 'The training and inference framework the jobs are written in.' },
      { products: ['nccl', 'rccl'], role: 'required', why: 'The collective library that moves data between GPUs, specific to the GPU vendor.' },
      { products: ['ceph', 'lustre'], role: 'recommended', why: 'Shared storage for datasets and checkpoints; neither has an AI-specific certification.' },
      { products: ['sonic', 'uec-specs'], role: 'recommended', why: 'An open switch operating system or the new Ethernet specification; neither is a complete fabric design.' },
      { products: ['slurm'], role: 'recommended', why: 'For teams that schedule with Slurm rather than Kubernetes.' },
      { products: ['prometheus'], role: 'recommended', why: 'Metrics for GPUs and the scheduler.' },
    ],
  },
  {
    id: 'agentic-ai',
    name: 'Agentic AI assistants',
    status: 'draft',
    url: OS.kagent,
    summary:
      'Agents that use tools and company data and act on a user\'s behalf, run on infrastructure the company controls: an agent runtime on Kubernetes, tools exposed over MCP, a model server and agent-to-agent messaging.',
    caveat: 'No published design validates an open agent stack end to end. kagent is a CNCF sandbox project below version 1, MCP\'s licence is being moved from MIT to Apache-2.0, and A2A\'s governance move into the Agentic AI Foundation is supported only by a site banner. The projects are young and their interfaces are changing; identity for agents (AGNTCY) is pre-1.0, and Cisco holds three of its eight steering seats.',
    designs: [],
    refs: [
      ['kagent', 'https://kagent.dev/'],
      ['Model Context Protocol', 'https://modelcontextprotocol.io/'],
      ['Agent2Agent protocol', 'https://a2a-protocol.org/latest/'],
    ],
    offMap: [
      { name: 'An agent framework', note: 'LangGraph, CrewAI and others build the agent logic; kagent runs and exposes it.' },
      { name: 'The tools themselves', note: 'MCP servers for your own systems must be written or sourced.' },
    ],
    questions: [
      'Which interface changes between kagent releases would break your agents?',
      'How are agents identified and authorised when they call tools and other agents?',
      'Who audits what an agent did, and where are the traces kept?',
    ],
    needs: [
      { products: ['kubernetes'], role: 'required', why: 'kagent runs agents as Kubernetes resources.' },
      { products: ['kagent'], role: 'required', why: 'The agent runtime, with gRPC, A2A and MCP interfaces.' },
      { products: ['mcp'], role: 'required', why: 'How agents reach tools and data; kagent consumes MCP tool servers.' },
      { products: ['vllm', 'sglang'], role: 'required', why: 'A model server for the agents\' language model; SGLang is tuned for agentic workloads.' },
      { products: ['open-weight-models'], role: 'required', why: 'The language model, under its own licence.' },
      { products: ['a2a'], role: 'recommended', why: 'For agents that call other agents; kagent exposes an A2A API.' },
      { products: ['agntcy'], role: 'recommended', why: 'Discovery and identity for agents; pre-1.0.' },
      { products: ['opentelemetry'], role: 'recommended', why: 'Traces for agent calls; the GenAI conventions are in development.' },
      { products: ['langfuse'], role: 'recommended', why: 'LLM-specific tracing and evaluation; part of the code is proprietary.' },
      { products: ['nemo-guardrails'], role: 'recommended', why: 'Input and output checks around the model.' },
    ],
  },
  {
    id: 'secure-private-ai',
    name: 'Secure private AI for regulated data',
    status: 'draft',
    url: OS.nvidiaCoco,
    summary:
      'AI that runs on the customer\'s own infrastructure because the data cannot leave, with protection at each layer: confidential containers for models and data in use, signed images, workload identity and policy.',
    caveat: 'The one published design is NVIDIA\'s reference architecture for confidential GPU pods, hosted by NVIDIA and built from upstream parts; it covers protection of data in use, not the network, identity or policy around it. It needs specific CPUs and GPUs, and there is no end-to-end design for the whole scenario. This is not a certification or a compliance claim.',
    designs: ['oss-nvidia-coco'],
    refs: [
      ['Confidential Containers', 'https://confidentialcontainers.org/docs/overview/'],
      ['NVIDIA reference architecture', 'https://docs.nvidia.com/datacenter/cloud-native/confidential-containers/1.1.0/index.html'],
      ['Kyverno', 'https://kyverno.io/docs/'],
    ],
    offMap: [
      { name: 'Trustee and Kata Containers', note: 'The attestation service and the lightweight VM runtime.' },
      { name: 'Confidential-computing hardware', note: 'AMD SEV-SNP or Intel TDX hosts, and Hopper, Blackwell or RTX PRO 6000 GPUs.' },
    ],
    questions: [
      'Which CPU and GPU combinations does your attestation service accept?',
      'Who runs and secures the attestation service, and what happens if it is unavailable?',
      'Which controls does your regulator expect that no project here provides?',
    ],
    needs: [
      { products: ['confidential-containers'], role: 'required', why: 'Runs pods in confidential virtual machines with attestation and secret release.' },
      { products: ['gpu-operator'], role: 'required', why: 'In NVIDIA\'s architecture it sets confidential mode on the GPUs.' },
      { products: ['kubernetes'], role: 'required', why: 'Kubernetes 1.32 or later is required.' },
      { products: ['kyverno', 'opa'], role: 'recommended', why: 'Policy for what may run; neither is part of NVIDIA\'s reference architecture.' },
      { products: ['sigstore-cosign'], role: 'recommended', why: 'Signing and verifying images and models.' },
      { products: ['spire'], role: 'recommended', why: 'Workload identity between the services in the cluster.' },
      { products: ['cilium', 'tetragon'], role: 'recommended', why: 'Network policy and runtime enforcement.' },
      { products: ['nemo-guardrails'], role: 'recommended', why: 'Guardrails for model inputs and outputs.' },
    ],
  },
  {
    id: 'ai-factory-operations',
    name: 'Operating the AI factory',
    status: 'draft',
    url: OS.dcgmExporter,
    summary:
      'Running the GPU cluster day to day: GPU and fabric telemetry in one view, experiment tracking and alerting, using open monitoring projects.',
    caveat: 'NVIDIA publishes a recipe that scrapes GPU metrics into Prometheus with DCGM-Exporter and draws them in Grafana, but it is a recipe, not a validated design, and no published design covers the fabric or storage. Grafana is AGPL-3.0 and controlled by one company; OpenTelemetry\'s GPU conventions are in development. Fabric telemetry comes from the switch operating system, not from these projects.',
    designs: [],
    refs: [
      ['DCGM-Exporter', 'https://github.com/NVIDIA/dcgm-exporter'],
      ['Prometheus overview', 'https://prometheus.io/docs/introduction/overview/'],
      ['OpenTelemetry', 'https://opentelemetry.io/docs/'],
    ],
    offMap: [
      { name: 'Switch and fabric telemetry', note: 'Comes from the switch operating system or a vendor tool.' },
      { name: 'Log storage and tracing backends', note: 'Loki, Jaeger and Tempo are separate projects not on this map.' },
    ],
    questions: [
      'Who maintains the dashboards and alert rules as the GPU model changes?',
      'Which monitoring data leaves the cluster, and where is it stored?',
      'Are you affected by Grafana\'s AGPL terms?',
    ],
    needs: [
      { products: ['prometheus'], role: 'required', why: 'Stores and alerts on GPU and cluster metrics.' },
      { products: ['dcgm-exporter'], role: 'required', why: 'Publishes NVIDIA GPU metrics in Prometheus format.' },
      { products: ['grafana'], role: 'required', why: 'Dashboards over the GPU and cluster metrics.' },
      { products: ['kubernetes'], role: 'required', why: 'The exporter and the GPU monitoring are deployed on Kubernetes.' },
      { products: ['opentelemetry'], role: 'recommended', why: 'A collector for traces and logs alongside the metrics.' },
      { products: ['mlflow'], role: 'recommended', why: 'Tracks training experiments and model versions.' },
      { products: ['slurm'], role: 'recommended', why: 'Job accounting for clusters that schedule with Slurm.' },
    ],
  },
  {
    id: 'llm-fine-tuning',
    name: 'Fine-tune a model on private data',
    status: 'draft',
    url: OS.kubeflow,
    summary:
      'Customise an open model on the company\'s own data and GPUs: a training framework, a trainer on Kubernetes, queueing and shared storage for datasets and checkpoints.',
    caveat: 'No published design validates this. Kubeflow Trainer\'s language model layer is thin: TorchTune is unmaintained, and TRL, Axolotl and Unsloth are not documented as part of the Trainer. Kueue\'s TrainJob integration is alpha. The result is an assembly you test yourself, and the base model\'s licence governs what you can do with the tuned weights.',
    designs: [],
    refs: [
      ['Kubeflow Trainer', 'https://www.kubeflow.org/docs/components/trainer/'],
      ['Kueue', 'https://kueue.sigs.k8s.io/docs/overview/'],
      ['PyTorch', 'https://pytorch.org/'],
    ],
    offMap: [
      { name: 'Fine-tuning libraries', note: 'Hugging Face TRL, Axolotl and Unsloth, which do the actual tuning.' },
      { name: 'Training data preparation', note: 'Curation and labelling are not covered by any project here.' },
    ],
    questions: [
      'Which fine-tuning library will you standardise on, given that the Trainer does not document one?',
      'Does the base model\'s licence allow the tuned weights to be used as you intend?',
      'Who keeps the Kueue and Trainer integration working while it is alpha?',
    ],
    needs: [
      { products: ['kubernetes'], role: 'required', why: 'The platform the training jobs run on.' },
      { products: ['pytorch'], role: 'required', why: 'The framework the fine-tuning code is written in.' },
      { products: ['kubeflow', 'ray'], role: 'required', why: 'Launches distributed training jobs; Kubeflow Trainer or Ray Train.' },
      { products: ['kueue', 'kai-scheduler', 'volcano'], role: 'required', why: 'Queueing, quota and gang scheduling for training jobs.' },
      { products: ['open-weight-models'], role: 'required', why: 'The base model to tune, under its own licence.' },
      { products: ['gpu-operator', 'rocm'], role: 'recommended', why: 'Exposes the GPUs to the training jobs.' },
      { products: ['nccl', 'rccl'], role: 'recommended', why: 'Collective communication across the training GPUs.' },
      { products: ['mlflow'], role: 'recommended', why: 'Tracks experiments and model versions.' },
      { products: ['ceph', 'lustre'], role: 'recommended', why: 'Storage for datasets and checkpoints.' },
    ],
  },
  {
    id: 'multi-tenant-ai-cloud',
    name: 'Multi-tenant AI cloud for service providers and sovereign AI',
    status: 'draft',
    url: OS.k8sTenancy,
    summary:
      'A service provider, neo cloud or national operator rents GPU capacity to several tenants, with each tenant\'s workloads, network and quota kept separate.',
    caveat: 'Kubernetes tenancy is documented by Kubernetes itself, but there is no published design for an AI cloud: tenant separation in the network fabric and in storage is thin on the open side, and neither SONiC nor the Ultra Ethernet specification gives a tenant-aware AI fabric on its own. Kubernetes namespaces are not a hard security boundary on their own, so the provider needs more than the projects here.',
    designs: [],
    refs: [
      ['Kubernetes multi-tenancy', 'https://kubernetes.io/docs/concepts/security/multi-tenancy/'],
      ['Kueue', 'https://kueue.sigs.k8s.io/docs/overview/'],
      ['Cilium network policy', 'https://docs.cilium.io/en/stable/security/policy/'],
    ],
    offMap: [
      { name: 'Virtual clusters', note: 'Projects such as vCluster give each tenant its own control plane.' },
      { name: 'Billing and a customer portal', note: 'No project here meters or bills tenants.' },
    ],
    questions: [
      'Is namespace isolation enough for your tenants, or do they need separate clusters or virtual machines?',
      'How is each tenant\'s traffic separated on the GPU fabric?',
      'How is tenant storage isolated and encrypted?',
    ],
    needs: [
      { products: ['kubernetes'], role: 'required', why: 'Namespaces, access control and quotas are the base of tenancy.' },
      { products: ['kueue', 'kai-scheduler', 'volcano'], role: 'required', why: 'Per-tenant quota and fair share of GPUs.' },
      { products: ['cilium', 'calico'], role: 'required', why: 'Network policy between tenants\' pods.' },
      { products: ['gpu-operator', 'rocm'], role: 'required', why: 'Exposes the GPUs to tenant workloads.' },
      { products: ['kyverno', 'opa'], role: 'recommended', why: 'Admission policy that enforces tenant rules.' },
      { products: ['spire'], role: 'recommended', why: 'Workload identity for services across tenants.' },
      { products: ['ceph'], role: 'recommended', why: 'Shared storage with per-tenant pools; no AI certification.' },
      { products: ['prometheus'], role: 'recommended', why: 'Per-tenant GPU and workload metrics.' },
    ],
  },
];

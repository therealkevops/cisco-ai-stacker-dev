// Customer use cases: what a customer is trying to do, and which products it takes.
//
// Each need names one product, or several that are alternatives to each other (`products` is "any
// of"). `role` is 'required' (the scenario does not work without it) or 'recommended' (a sensible
// addition the published designs do not themselves include). `status` on the use case is:
//   'sourced' - the required needs come from the design guides listed in `designs`
//   'draft'   - an editorial reading of Cisco's published designs; review before using with a customer
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
    designs: ['flashstack-rag', 'flexpod-rag'],
    needs: [
      { products: ['ucs-x'], role: 'required', why: 'GPU-capable compute: the chassis, compute nodes and PCIe GPU nodes both guides are built on.' },
      { products: ['nvidia-gpu'], role: 'required', why: 'GPUs for inference and embedding. Both guides use two L40S per GPU node.' },
      { products: ['ucs-fi'], role: 'required', why: 'Fabric interconnects that connect the chassis to the network and run it in Intersight Managed Mode.' },
      { products: ['nexus-9000'], role: 'required', why: 'Data center switching. Both guides use Nexus 93600CD-GX.' },
      { products: ['intersight'], role: 'required', why: 'Infrastructure management for the servers and fabric interconnects.' },
      { products: ['openshift'], role: 'required', why: 'The Kubernetes platform the NIM microservices run on: OpenShift on bare metal in both guides.' },
      { products: ['nvidia-ai-enterprise'], role: 'required', why: 'NVIDIA AI Enterprise, which brings the NIM microservices for the language model, embedding and reranking.' },
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
    designs: ['pod-2-8-9-400', 'ai-pod', 'secure-ai-factory'],
    needs: [
      { products: ['c885a'], role: 'required', why: 'The eight-GPU server the 2-8-9-400 design is built on.' },
      { products: ['nvidia-gpu'], role: 'required', why: 'Eight HGX GPUs per server.' },
      { products: ['bluefield'], role: 'required', why: 'BlueField adapters for the servers\' external links.' },
      { products: ['n9364e'], role: 'required', why: '64-port 800G switching for the back-end GPU fabric and the front-end network.' },
      { products: ['intersight'], role: 'required', why: 'Lifecycle and policy management for the servers.' },
      { products: ['nexus-dashboard', 'hyperfabric'], role: 'required', why: 'Fabric management: Nexus Dashboard on premises, or Nexus Hyperfabric AI as a cloud service.' },
      { products: ['nvidia-ai-enterprise'], role: 'required', why: 'NVIDIA\'s supported software layer for the GPUs.' },
      { products: ['openshift', 'kubernetes'], role: 'required', why: 'A Kubernetes platform to schedule workloads onto the GPUs: OpenShift or upstream Kubernetes. Nutanix NKP is also supported, and is counted under storage.' },
      { products: ['netapp', 'pure', 'vast', 'hitachi', 'nutanix'], role: 'required', why: 'Shared storage on the front-end network, from one of the validated storage partners.' },
      { products: ['ai-defense'], role: 'recommended', why: 'Secures the models and applications that run on the cluster.' },
      { products: ['hybrid-mesh-fw'], role: 'recommended', why: 'Enforcement on the BlueField DPUs, close to the workload.' },
      { products: ['splunk-obs'], role: 'recommended', why: 'Visibility into AI infrastructure health.' },
    ],
  },
];

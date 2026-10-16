# RAG Architecture

## RAG 知识库与问答流程

```mermaid
flowchart TD

    A[公司文档<br/>PDF / Word / TXT] --> B[Chunk<br/>文档切块]
    B --> C[Embedding<br/>文本向量化]
    C --> D[Vector Database<br/>向量数据库]

    E[用户问题] --> F[Embedding<br/>问题向量化]
    F --> G[Retrieval<br/>语义检索]

    D --> G
    G --> H[Relevant Chunks<br/>相关文本片段]

    H --> I[LLM<br/>DeepSeek]
    E --> I

    I --> J[最终答案<br/>返回用户]
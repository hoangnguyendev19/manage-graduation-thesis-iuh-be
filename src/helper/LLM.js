const CHUNK_SIZE = 10000;
const CHUNK_OVERLAP = 1000;
const formatDocumentsAsString = (documents) => {
    return documents.map((document) => document.pageContent).join('\n\n');
};

// const category = ['WEB', 'APP', 'SYSTEM', 'AI', 'DATA', 'SECURITY', 'NETWORK', 'OTHER'];

const CLASSIFICATION_TOPICS_TEMPLATE = (category = []) => {
    return `
    You must respond using JSON format only. Do not include any other text or formatting.
    ----------------
    {context}

    Based on the descriptions above, classify the project into one of the following categories:
    ${category.map((c) => `\n- ${c}`).join('')}

    Please return multi JSON object in the following structure:
    {{
    [
    {{"category_name": "string",
      "id": "string",
    }}
    ]
    }}
    Return only the JSON string without any additional text.
  `;
};

const CLASSIFICATION_LECTURERS_TEMPLATE = (category = []) => {
    return `
    You must respond using JSON format only. Do not include any other text or formatting.
    ----------------
    {context}

    Based on the descriptions above, classify the project into one of the following categories:
    ${category.map((c) => `\n- ${c}`).join('')}

    Please return multi JSON object in the following structure:
    {{
    [
    {{
      "lecturerTermId": "string",
      "categories":[{{
        "category_name": "string",
        "total": "number",
      }}]
    }}
    ]
    }}
    `;
};

module.exports = {
    CHUNK_SIZE,
    CHUNK_OVERLAP,
    CLASSIFICATION_TOPICS_TEMPLATE,
    CLASSIFICATION_LECTURERS_TEMPLATE,
    formatDocumentsAsString,
};

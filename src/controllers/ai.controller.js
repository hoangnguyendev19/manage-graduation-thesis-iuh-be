//[Backend libs]
const { sequelize } = require('../configs/connectDB');
const { Assign, Topic } = require('../models');
const Error = require('../helper/errors');
const { HTTP_STATUS } = require('../constants/constant');
const { QueryTypes } = require('sequelize');
const fs = require('fs');

//[AI libs]
const { genAIModel, genChat } = require('../configs/connectGemini');
const { MemoryVectorStore } = require('langchain/vectorstores/memory');
const { RunnablePassthrough, RunnableSequence } = require('@langchain/core/runnables');
const { JsonOutputParser, StringOutputParser } = require('@langchain/core/output_parsers');
const { ChatPromptTemplate } = require('@langchain/core/prompts');
const { RecursiveCharacterTextSplitter } = require('langchain/text_splitter');
const {
    CHUNK_SIZE,
    CHUNK_OVERLAP,
    CLASSIFICATION_TOPICS_TEMPLATE,
    CLASSIFICATION_LECTURERS_TEMPLATE,
    formatDocumentsAsString,
} = require('../helper/LLM');

//TODO [API HELP]
const getGrStudentsToAssign = async (type, termId) => {
    try {
        const assigns = await Assign.findAll({
            attributes: ['group_student_id'],
            where: {
                type: type.toUpperCase(),
            },
        });
        const myNotIn = assigns.map((ass) => `'${ass.group_student_id}'`);
        const notInCondition = myNotIn.length > 0 ? `AND gs.id NOT IN (${myNotIn.join(',')})` : '';
        const groupStudents = await sequelize.query(
            `SELECT gs.id as groupStudentId, t.id
            FROM group_students gs
            INNER JOIN topics t ON gs.topic_id = t.id
            INNER JOIN lecturer_terms lt ON t.lecturer_term_id = lt.id
            INNER JOIN lecturers l ON lt.lecturer_id = l.id
            WHERE gs.term_id = :termId ${notInCondition}`,
            {
                replacements: { termId },
                type: QueryTypes.SELECT,
            },
        );
        return groupStudents;
    } catch (error) {
        return Error.sendError(res, error);
    }
};
const getTopics = async (termId) => {
    try {
        const sql = `SELECT t.id, t.name, lecturer_term_id as lecturerTermId
        from topics t
        left join
        lecturer_terms lt 
        on lt.id = t.lecturer_term_id
        where
        lt.term_id = :termId 
        `;
        const topics = await sequelize.query(sql, {
            replacements: { termId },
            type: QueryTypes.SELECT,
        });
        return topics;
    } catch (error) {
        console.log('🚀 ~ getTopics ~ error:', error);
    }
};

// TODO [HANDLE DATA]
const mergedArray = (arr1, arr2) =>
    arr1.map((item1) => {
        const item2 = arr2.find((item) => item.id === item1.id);
        return { ...item1, ...item2 };
    });

//! ---------------------------[CLASSIFY TOPICS]--------------------------------

// TODO [PROCESSING DATA]
const classify_topics_result = async (termId) => {
    const topics = await getTopics(termId);
    const jsons_file = JSON.stringify(topics);
    const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: CHUNK_SIZE,
        chunkOverlap: CHUNK_OVERLAP,
    });
    const docs = await textSplitter.createDocuments([jsons_file]);
    const vectorStore = await MemoryVectorStore.fromDocuments(docs, genAIModel);
    const vectorStoreRetriever = vectorStore.asRetriever();

    const prompt = ChatPromptTemplate.fromMessages([
        ['system', CLASSIFICATION_TOPICS_TEMPLATE],
        ['human', '{question}'],
    ]);
    const chain = RunnableSequence.from([
        {
            context: vectorStoreRetriever.pipe(formatDocumentsAsString),
            question: new RunnablePassthrough(),
        },
        prompt,
        genChat,
        new JsonOutputParser(),
    ]);
    const answer = await chain.invoke('What category does this project belong to?');
    return answer;
};

//TODO [SAVE DATA]
const saveDataTopics = async (payload) => {
    try {
        const vector_path = `${__dirname.split('src')[0]}\src\\vectorDB`;
        fs.writeFileSync(`${vector_path}\\topics.json`, JSON.stringify(payload), {
            encoding: 'utf8',
        });
        return true;
    } catch (error) {
        console.log('🚀 ~ saveData ~ error:', error);
        return false;
    }
};

//TODO [ASSIGN]
const analysisOfTopics = async (type, termId) => {
    const classify = await classify_topics_result(termId);
    const data = await getGrStudentsToAssign(type, termId);
    const maping = await mergedArray(data, classify);
    saveDataTopics(maping);
    console.log('🚀 ~ saveData ~ success!!!!!!!!!!!!!!!!!!!!!!!!');
};
analysisOfTopics('advisor', '8fb8fbda-37ed-4861-a3a2-236500e62ee6');

//! ---------------------------[CLASSIFY LECTURER]--------------------------------

//TODO [PROCESSING DATA]
const classify_lecturer_result = async (termId) => {
    const topics = await getTopics(termId);
    const jsons_file = JSON.stringify(topics);
    const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: CHUNK_SIZE,
        chunkOverlap: CHUNK_OVERLAP,
    });
    const docs = await textSplitter.createDocuments([jsons_file]);
    const vectorStore = await MemoryVectorStore.fromDocuments(docs, genAIModel);
    const vectorStoreRetriever = vectorStore.asRetriever();

    const prompt = ChatPromptTemplate.fromMessages([
        ['system', CLASSIFICATION_LECTURERS_TEMPLATE],
        ['human', '{question}'],
    ]);
    const chain = RunnableSequence.from([
        {
            context: vectorStoreRetriever.pipe(formatDocumentsAsString),
            question: new RunnablePassthrough(),
        },
        prompt,
        genChat,
        new JsonOutputParser(),
    ]);
    const answer = await chain.invoke('What category does this project belong to?');
    return answer;
};
//TODO [SAVE DATA]
const saveDataLecturers = async (payload) => {
    try {
        const vector_path = `${__dirname.split('src')[0]}\src\\vectorDB`;
        fs.writeFileSync(`${vector_path}\\lecturers.json`, JSON.stringify(payload), {
            encoding: 'utf8',
        });
        return true;
    } catch (error) {
        console.log('🚀 ~ saveData ~ error:', error);
        return false;
    }
};
//TODO [ASSIGN]
const analysisOfLecturers = async (termId) => {
    const classify = await classify_lecturer_result(termId);
    saveDataLecturers(classify);
    console.log('🚀 ~ saveData ~ success!!!!!!!!!!!!!!!!!!!!!!!!');
};
// analysisOfLecturers('8fb8fbda-37ed-4861-a3a2-236500e62ee6');

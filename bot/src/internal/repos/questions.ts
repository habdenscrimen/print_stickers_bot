import admin from 'firebase-admin'
import { customAlphabet } from 'nanoid'
import { lowercase } from 'nanoid-dictionary'
import { QuestionsRepo } from '.'
import { Question } from '../domain'

type Handler<HandlerName extends keyof QuestionsRepo> = (
  database: admin.firestore.Firestore,
  args: Parameters<QuestionsRepo[HandlerName]>,
) => ReturnType<QuestionsRepo[HandlerName]>

export const newQuestionsRepo = (db: admin.firestore.Firestore): QuestionsRepo => {
  return {
    CreateQuestion: (...args) => createQuestion(db, [...args]),
    GetUnansweredQuestions: (...args) => getUnansweredQuestions(db, [...args]),
    UpdateQuestion: (...args) => updateQuestion(db, [...args]),
    GetQuestion: (...args) => getQuestion(db, [...args]),
  }
}

export const createQuestion: Handler<'CreateQuestion'> = async (db, [question]) => {
  const questionID = customAlphabet(lowercase, 20)()

  const now = new Date().toISOString()

  await db
    .collection('questions')
    .doc(questionID)
    .set({
      ...question,
      id: questionID,
      created_at: now,
      answered_at: null,
    } as Question)

  return questionID
}

export const getUnansweredQuestions: Handler<'GetUnansweredQuestions'> = async (db) => {
  const snapshot = await db.collection('questions').where('answered_at', '==', null).get()

  return snapshot.docs.map((doc) => doc.data() as Question)
}

export const getQuestion: Handler<'GetQuestion'> = async (db, [{ questionID }]) => {
  const snapshot = await db.collection('questions').doc(questionID).get()

  return snapshot.data() as Question
}

export const updateQuestion: Handler<'UpdateQuestion'> = async (
  db,
  [{ questionID, question }],
) => {
  await db.collection('questions').doc(questionID).update(question)
}

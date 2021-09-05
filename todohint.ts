import Notion, { Lesson } from "./notion";
import { getOrderedInfo, getProcessArgv } from './utlis';
import nodemailer from "nodemailer";

const { mailName, mailPasswd, databaseId, notionToken } = getProcessArgv();

const mailConfig = {
    host: "smtp.exmail.qq.com",
    port: 465,
    secure: true,
    auth: {
        user: mailName,
        pass: mailPasswd
    }
} as const;

const mailSender = nodemailer.createTransport(mailConfig);

(async function () {
    const res = await Notion.queryAllInfo(databaseId, notionToken);
    const ordered = getOrderedInfo(res);
    const withoutBreakLessonList = new Map<string, Lesson>();
    ordered.forEach(lesson => {
        let flag = false;

        lesson.todoList.forEach(todo => {
            if (todo.checked === false) {
                flag = true;
            }
        });

        if (flag) {
            const mapLesson = withoutBreakLessonList.get(lesson.name);
            if (!mapLesson) {
                withoutBreakLessonList.set(lesson.name, lesson);
            } else {
                mapLesson.todoList.push(...lesson.todoList);
            }
        }
    });

    let html = ``;

    for (const [lessonName, lesson] of withoutBreakLessonList) {
        const newAdd = `
        <h3>[${lesson.name}]</h3>
        <p>${lesson.todoList.map(x => x.name).join("，")}</p>
        `
        html += newAdd;
    }

    if (withoutBreakLessonList.size === 0) {
        html += "太棒了！没有要做的事情！";
    }

    await mailSender.sendMail({
        from: `TodoHint <${mailName}>`,
        to: "therainisme@qq.com",
        subject: `TodoHint`,
        text: "This is a text",
        html: html
    });
})();
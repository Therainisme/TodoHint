import Notion, { Lesson } from "./notion";
import nodemailer from "nodemailer";
import { getBeijingTime, getDay, getOrderedInfo, hourToMinute } from "./utlis";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

const arg: any = yargs(hideBin(process.argv)).argv;
const { mailName, mailPasswd, databaseId, notionToken } = arg;

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

async function remind(lesson: Lesson) {
    const Dt = getBeijingTime()
    if (getDay(lesson.week) === Dt.getDay()) {

        const nowTimePoint = hourToMinute(Dt.getHours() + "");
        const courseStartTimePoint = hourToMinute(lesson.time.split("-")[0]);
        const courseEndTimePoint = hourToMinute(lesson.time.split("-")[1]);
        if (courseStartTimePoint < nowTimePoint + 60 + 35 && nowTimePoint + 60 + 35 < courseEndTimePoint) {
            console.log(`Lesson [${lesson.name}] will begin at [${lesson.time.split("-")[0]}]`)
            await mailSender.sendMail({
                from: `Lesson Reminder <${mailName}>`,
                to: "therainisme@qq.com",
                subject: `${lesson.name}上课提醒`,
                text: "This is a text",
                html: `
                    <p>时间：${lesson.time}</p>
                    <p>教室：${lesson.room}</p>
                    ${lesson.todoList.length > 0 ? `
                        <h3>Todo</h3>
                        <ul>
                        ${lesson.todoList.map(x => `<li>${x.name}</li>`)}
                        </ul>
                    ` : ''}
                `,
            });
        }
    }
}



(async function () {
    const res = await Notion.queryAllInfo(databaseId, notionToken);
    const ordered = getOrderedInfo(res);
    ordered.forEach(x => {
        remind(x);
    });
})();
import Notion, { Course } from "./notion";
import nodemailer from "nodemailer";
import { getDay, hourToMinute } from "./utlis";
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

async function remind(course: Course) {
    const Dt = new Date();
    if (getDay(course.week) === Dt.getDay()) {

        const nowTimePoint = hourToMinute(Dt.getHours() + "");
        const courseStartTimePoint = hourToMinute(course.time.split("-")[0]);
        const courseEndTimePoint = hourToMinute(course.time.split("-")[1]);
        if (courseStartTimePoint < nowTimePoint + 60 + 35 && nowTimePoint + 60 + 35 < courseEndTimePoint) {
            await mailSender.sendMail({
                from: `Course Reminder <${mailName}>`,
                to: "therainisme@qq.com",
                subject: `${course.name}上课提醒`,
                text: "This is a text",
                html: `
                    <p>时间：${course.time}</p>
                    <p>教室：${course.room}</p>
                    ${course.todoList.length > 0 ? `
                        <h3>Todo</h3>
                        <ul>
                        ${course.todoList.map(x => `<li>${x.name}</li>`)}
                        </ul>
                    ` : ''}
                `,
            });
        }
    }
}



(async function () {
    const res = await Notion.queryAllInfo(databaseId, notionToken);
    const ordered = res.sort((x, y) => {
        return hourToMinute(x.time.split("-")[0]) - hourToMinute(y.time.split("-")[0]);
    }).sort((x, y) => {
        return getDay(x.week) - getDay(y.week);
    }).forEach(x => {
        remind(x);
    });
})();
import fetch from "node-fetch";

export async function queryDatabase(databaseId: string, token: string): Promise<Omit<Course, "todoList">[]> {
    const response = await fetch(
        `https://api.notion.com/v1/databases/${databaseId}/query`,
        {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Notion-Version": "2021-08-16"
            }
        }
    );
    const json = await response.json();
    const res: Omit<Course, "todoList">[] = json["results"].map((x: any) => {
        return {
            id: x.id,
            name: x.properties.Name.title[0].text.content,
            type: x.object,
            week: x.properties.when.select.name,
            teacher: x.properties.teacher.select.name,
            room: x.properties.room.rich_text[0].text.content,
            time: x.properties.time.select.name
        }
    });
    return res;
}

export async function queryTodo(pageId: string, token: string): Promise<Todo[]> {
    const response = await fetch(
        `https://api.notion.com/v1/blocks/${pageId}/children`,
        {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Notion-Version": "2021-08-16"
            }
        }
    );
    const json = await response.json();
    const res: Todo[] = json["results"]
        .filter((x: any) => {
            return x.type ? x.type === "to_do" : false;
        })
        .filter((x: any) => {
            return x.to_do.text.length > 0 && x.to_do.text[0].text.content;
        })
        .map((x: any) => {
            return {
                name: x.to_do.text[0].text.content,
                checked: x.to_do.checked
            }
        })
    return res;
}

export async function queryAllInfo(databaseId: string, token: string): Promise<Course[]> {
    const courseList = await queryDatabase(databaseId, token);
    return await Promise.all(
        courseList.map(async (x: any) => {
            return {
                ...x,
                todoList: (await queryTodo(x.id, token))
            }
        })
    );
}

export default {
    queryAllInfo
}


interface Course {
    id: string;
    name: string;
    type: string;
    week: string;
    teacher: string;
    room: string;
    time: string;
    todoList: Todo[];
}

interface Todo {
    name: string;
    checked: boolean;
}
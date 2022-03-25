import React, { useState } from 'react';
import * as microsoftTeams from "@microsoft/teams-js";
import { IQuestionDetails } from '../types/question';
import { Flex, Text } from '@fluentui/react-northstar'
import Editor from '@monaco-editor/react';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';

const Question =(props :any)=>
{
    const params = props.match.params;
    const questionNumber = params['questionId'];
    const [data, setData] = React.useState();
    const [connection, setConnection] = useState<null | HubConnection>(null);
    React.useEffect(() => {
        microsoftTeams.initialize();
        
    }, [])

    React.useEffect(() => {
        const connect = new HubConnectionBuilder()
            .withUrl(`${window.location.origin}/chatHub`)
            .withAutomaticReconnect()
            .build();

        setConnection(connect);
    }, []);

    React.useEffect(() => {
        if (connection) {
            connection
                .start()
                .then(() => {
                    connection.on("ReceiveMessage", (user: any, description: any) => {
                        setData(description);
                    });
                })
                .catch((error) => console.log(error));
        }
    }, [connection]);

    const emitMessageAction = (handleEditorChange: any, time: any) => {
        let timer: any;
        return (...argument: any) => {
            clearTimeout(timer);
            timer = setTimeout(() => {
                handleEditorChange.apply(this, argument);
            }, time)
        }
    }

    const handleEditor = emitMessageAction(async (value: any) => {
        if (connection) await connection.send("SendMessage", "test", value);
    }, 2000);
    
    return (
        <>
            {IQuestionDetails.questions ? IQuestionDetails.questions.map((question) => {
                if (question.questionId == questionNumber){
                    return <>
                        <Flex gap="gap.small">
                            <Text content={question.questionId} weight="bold" />
                            <Flex column>
                                <Text className="text-ui" content={"Question: " + question.question} weight="bold" />
                                <Text className="text-ui" content={"Language: " + question.language} size="small" />
                                <Text className="text-ui" content={"Expected output: " + question.expectedOuput} size="small" />
                            </Flex>
                        </Flex>
  
                        <Editor
                            height="80vh"
                            defaultLanguage={question.language}
                            defaultValue={question.defaultValue}
                            value={data}
                            onChange={handleEditor}
                        />
                    </>
                }
            }) : null}
        </>
    )
}

export default (Question)
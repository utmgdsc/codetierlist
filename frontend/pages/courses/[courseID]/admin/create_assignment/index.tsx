import axios, { handleError } from "@/axios";
import { ControlCard, HeaderToolbar, Monaco } from "@/components";
import { SnackbarContext } from "@/contexts/SnackbarContext";
import { UserContext } from "@/contexts/UserContext";
import {
    Button, Caption1, Card, CardHeader, Dropdown,
    Input,
    Label,
    Option,
    OptionGroup,
    Title2, ToolbarButton
} from "@fluentui/react-components";
import {
    ArrowLeft24Regular,
    Calendar24Regular,
    Rename24Regular,
    Run24Regular,
    TextDescription24Regular
} from '@fluentui/react-icons';
import { RunnerImage } from "codetierlist-types";
import Head from "next/head";
import { useRouter } from "next/router";
import { useContext, useEffect, useState } from "react";
import { Container } from "react-grid-system";

import styles from "./page.module.css";

/**
 * Converts an ISO string to a date object
 */
const updateTimezoneOffset = (date: string) => {
    const d = new Date(date);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d;
};

export default function Page(): JSX.Element {
    const { showSnackSev } = useContext(SnackbarContext);
    const [assignmentName, setAssignmentName] = useState("");
    const [description, setDescription] = useState("");
    const [runners, setRunners] = useState<Record<string, string[]>>({});
    const [selectedRunner, setSelectedRunner] = useState<RunnerImage | null>(null);
    const [dueDate, setDueDate] = useState(new Date());
    const { courseID } = useRouter().query;
    const { fetchUserInfo } = useContext(UserContext);

    const router = useRouter();

    const submitAssignment = async () => {
        if (!description) {
            showSnackSev("Description is required", "error");
            return;
        }

        axios.post(`/courses/${courseID}/assignments`, {
            name: assignmentName,
            description: description,
            dueDate: dueDate.toISOString(),
            ...selectedRunner
        })
            .then(fetchUserInfo)
            .then(() => router.push(`/courses/${courseID}`))
            .catch(
                handleError(showSnackSev)
            );
    };

    useEffect(() => {

        const fetchRunners = async () => {
            const res = await axios.get<RunnerImage[]>("/runner/images").catch(handleError(showSnackSev));
            if (!res) {
                return;
            }
            setRunners(res.data.reduce((acc, runner) => {
                acc[runner.image] = acc[runner.image] ?? [];
                acc[runner.image].push(runner.image_version);
                return acc;
            }, {} as Record<string, string[]>));

            setSelectedRunner(res.data[0]);
        };

        void fetchRunners();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [showSnackSev]);

    return (
        <>
            <Head>
                <title>Create Assignment - Codetierlist</title>
            </Head>

            <HeaderToolbar>
                <ToolbarButton
                    icon={<ArrowLeft24Regular />}
                    onClick={() => router.push(`/courses/${router.query.courseID}`)}
                >
                    Back to Course
                </ToolbarButton>
            </HeaderToolbar>

            <Container component="main" className="p-y-xxxl">
                <form
                    className={styles.form}
                    onSubmit={(e) => {
                        e.preventDefault();
                        void submitAssignment();
                    }}>
                    <Title2 className={styles.title} block>Create Assignment</Title2>

                    <ControlCard
                        required
                        title="Name"
                        description="The name that will be displayed to the students."
                        icon={<Rename24Regular />}
                        htmlFor="name">
                        <Input required type="text" id="name" name="courseCode"
                            value={assignmentName}
                            onChange={e => setAssignmentName(e.target.value)} />
                    </ControlCard>

                    <ControlCard
                        required
                        title="Due date"
                        description="The date and time when the assignment is due."
                        icon={<Calendar24Regular />}
                        htmlFor="dueDate">
                        <Input
                            required
                            type="datetime-local"
                            id="dueDate"
                            name="dueDate"
                            value={dueDate.toISOString().slice(0, -8)}
                            onChange={e => {
                                // check if the date is valid
                                if (new Date(e.target.value).toString() !== "Invalid Date")
                                    setDueDate(updateTimezoneOffset(e.target.value));
                            }} />
                    </ControlCard>

                    <ControlCard
                        required
                        title="Runner image"
                        description="The runner image is the image that the runners use to run uploaded code. If you think an image is missing please contact the maintainers."
                        icon={<Run24Regular />}
                        htmlFor="runner">
                        <Dropdown id="runner" name="runner"
                            value={selectedRunner?.image + "/" + selectedRunner?.image_version}
                            onOptionSelect={(_, data) => setSelectedRunner(JSON.parse(data.optionValue ?? "undefined") as RunnerImage)}
                        >
                            {Object.keys(runners).map(image =>
                                <OptionGroup
                                    label={image} key={image}>
                                    {runners[image].map(version =>
                                        <Option key={`${image}/${version}`}
                                            text={`${image}/${version}`}
                                            value={JSON.stringify({ image, image_version: version })}>
                                            {image}/{version}
                                        </Option>
                                    )}
                                </OptionGroup>
                            )}
                        </Dropdown>
                    </ControlCard>

                    <Card size="large">
                        <CardHeader
                            image={
                                <TextDescription24Regular />
                            }
                            header={<Label required className={styles.semibold} htmlFor="description">Description</Label>}
                            description={
                                <Caption1>The description is displayed to the students.</Caption1>
                            }
                        />

                        <Monaco
                            value={description}
                            onChange={(value) => setDescription(value || "")}
                            language="markdown"
                            height="500px"
                        />

                    </Card>

                    <div className={styles.submit}>
                        <Button type="submit"
                            appearance="primary">Create</Button>
                    </div>
                </form>
            </Container>
        </>
    );
}

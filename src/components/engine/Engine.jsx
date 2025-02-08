import { useState, useEffect } from 'react';
import {
    Box,
    Group,
    ScrollArea,
    SimpleGrid,
    Stack,
    Text,
    Title,
    Paper
} from "@mantine/core";
import AddEngine from './AddEngine';
import EngineCard from './EngineCard';
const { ipcRenderer } = require('electron');
import EngineSettings from './EngineSettings';

function Engine() {
    const [opened, setOpened] = useState(false);
    const [engines, setEngines] = useState([]);
    const [selected, setSelected] = useState(null);

    useEffect(() => {
        ipcRenderer.send('load-engine-data');

        const handleEngines = (event, engines) => {
            setEngines(engines);
        };

        ipcRenderer.on('engines', handleEngines);

        return () => {
            ipcRenderer.removeListener('engines', handleEngines);
        };
    }, [engines]);

    useEffect(() => {
        console.log(`Engine:${selected}`);
    }, [selected]);

    return (
        <Stack h="100%" px="lg" pb="lg">
            <AddEngine opened={opened} setOpened={setOpened} />
            <Group align="baseline" py="sm">
                <Title>Your Engines</Title>
            </Group>
            <Group grow flex={1} style={{ overflow: "hidden" }} align="start">
                <ScrollArea h="100%" offsetScrollbars>
                    <SimpleGrid
                        cols={{ base: 1, md: 2 }}
                        spacing={{ base: "md", md: "sm" }}
                    >
                        {engines.map((item, i) => (
                                <EngineCard
                                    id={i}
                                    key={ item.name}
                                    setSelected={setSelected}
                                    engine={ item}
                                />
                        ))}
                        <Box
                            component="button"
                            type="button"
                            onClick={() => setOpened(true)}
                        >
                            <Stack gap={0} justify="center" w="100%" h="100%">
                                <Text mb={10}>Add New</Text>
                            </Stack>
                        </Box>
                    </SimpleGrid>
                </ScrollArea>
                <Paper withBorder p="md" w="500px" h="100%">
                    {(selected==null) ? (
                        <Text ta="center">No engine selected</Text>
                    ) : (
                        <EngineSettings
                            selected={selected}
                            setSelected={setSelected}
                            engines={engines}
                        />
                    )
                    }
                </Paper>
            </Group>
        </Stack>
    );
}

export default Engine;


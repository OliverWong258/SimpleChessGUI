import { Box, Stack, Text, Paper } from "@mantine/core";
import PropTypes from 'prop-types';

export default function EngineCard({ id, setSelected, engine }) {
    return (
        <Box
            onClick={() => {
                setSelected(id);
            }}
        >
            <Stack h="100%" justify="space-between">
                <Paper withBorder p="md" h="100%" >
                    <Stack gap={0}>
                        <Text fw="bold" lineClamp={1} >
                            {engine.name}
                        </Text>
                        <Text
                            size="xs"
                            c="dimmed"
                            style={{ wordWrap: "break-word" }}
                            lineClamp={1}
                        >
                            {engine.path.split(/\/|\\/).slice(-1)[0]}
                        </Text>
                    </Stack>
                </Paper>
            </Stack>
        </Box>
    );
}

EngineCard.propTypes = {
    id: PropTypes.number.isRequired,
    setSelected: PropTypes.func.isRequired,
    engine: PropTypes.object.isRequired     
}
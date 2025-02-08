import { SegmentedControl, Group, NumberInput } from "@mantine/core";
import PropTypes from 'prop-types';

function EngineGoMode({ goMode, setGoMode }) {

    function switchGoMode(v) {
        switch (v) {
            case "depth":
                return { t: "depth", c: 20 };
            case "nodes":
                return { t: "nodes", c: 1000000 };
            case "time":
                return { t: "time", c: 8000 };
            default:
                return { t: "infinite" };
        }
    }

    const renderInput = () => {
        switch (goMode.t) {
            case 'depth':
                return (
                    <NumberInput
                        min={1}
                        value={goMode.c}
                        onChange={(v) => setGoMode({ t: 'depth', c: typeof v === 'number' ? v : 1 })}
                    />
                );
            case 'nodes':
                return (
                    <NumberInput
                        min={1}
                        value={goMode.c}
                        onChange={(v) => setGoMode({ t: 'nodes', c: typeof v === 'number' ? v : 1 })}
                    />
                );
            case 'time':
                return (
                    <NumberInput
                        min={1000}
                        value={goMode.c}
                        suffix="ms"
                        onChange={(v) => setGoMode({ t: 'time', c: typeof v === 'number' ? v : 1 })}
                    />
                );
            default:
                return null; // 如果不匹配任何模式，则不渲染任何东西
        }
    };

    return (
        <Group>
            <SegmentedControl
                data={[
                    { value: "time", label: "Time" },
                    { value: "depth", label: "Depth" },
                    { value: "nodes", label: "Nodes" },
                    { value: "infinite", label: "Infinite" }
                ]}
                value={goMode.t.toLowerCase()}
                onChange={(v) => {
                    const newGo = switchGoMode(v);
                    setGoMode(newGo);
                }}
            />
            {renderInput()}
        </Group>
    )
}

export default EngineGoMode;

EngineGoMode.propTypes = {
    goMode: PropTypes.object.isRequired,
    setGoMode: PropTypes.func.isRequired
};
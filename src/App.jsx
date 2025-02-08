import styles from './App.module.css';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Board from './components/board/Board';
import Engine from './components/engine/Engine'
import { MantineProvider, Button, Paper } from '@mantine/core';
import "@mantine/core/styles.css";
import {   IconChessQueen, IconAssembly } from '@tabler/icons-react';

function App() {

    return (
        <MantineProvider>
            <Router>
                <div className={styles.appContainer}>
                    <Paper withBorder radius="none" p="md" h="100%" w="10%">
                        <nav className={styles.nav}>
                            <Link to="/"><Button className={styles.button} variant="default" leftSection={<IconChessQueen size={14} />} >Board</Button></Link>
                            <Link to="/engine"><Button className={styles.button} variant="default" leftSection={<IconAssembly size={14} />}>Engine</Button></Link>
                        </nav>
                    </Paper>
                    <Paper withBorder radius="none" p="md" h="100%" w="90%">
                        <Routes>
                            <Route path="/*" element={<Board />} />
                            <Route path="/engine" element={ <Engine />} />
                        </Routes>
                    </Paper>
                </div>
            </Router>
        </MantineProvider>
  )
}

export default App

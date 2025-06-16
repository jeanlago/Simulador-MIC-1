import { Table, TableHead, TableRow, TableCell, TableBody } from '@mui/material';
import { HistoryEntry } from '../services/mic1Api';

interface Props {
  entries: HistoryEntry[];
}

export default function HistoryView({ entries }: Props) {
  return (
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell>Cycle</TableCell>
          <TableCell>Micro-instr.</TableCell>
          <TableCell>Bus&nbsp;(from&nbsp;→&nbsp;to)</TableCell>
        </TableRow>
      </TableHead>

      <TableBody>
        {entries.map(e => (
          <TableRow key={e.cycle}>
            <TableCell>{e.cycle}</TableCell>
            <TableCell sx={{ fontFamily:'monospace' }}>{e.micro}</TableCell>
            <TableCell>{e.bus.from} → {e.bus.to}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

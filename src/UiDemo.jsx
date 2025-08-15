import { Button } from "./components/ui/button";
import { Card } from "./components/ui/card";
import { Input } from "./components/ui/input";
export default function UiDemo(){
  return (
    <div className="container-app py-8">
      <h1 className="text-2xl font-semibold mb-4">UI Demo</h1>
      <Card className="p-4 mb-4">Tarjeta de ejemplo</Card>
      <div className="mb-4"><Input placeholder="Cédula" /></div>
      <Button>Botón primario</Button>
    </div>
  );
}

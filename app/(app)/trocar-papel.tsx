import { useTrocarPapelViewModel } from "../../src/modulos/auth/viewmodel/useTrocarPapelViewModel";
import { TrocarPapelView } from "../../src/modulos/auth/view/TrocarPapelView";

export default function TrocarPapel() {
  const vm = useTrocarPapelViewModel();
  return <TrocarPapelView {...vm} />;
}

import { PublicLayout } from "@/components/layout/public-layout";
import { OrderStatus } from "./order-status";

interface PedidoPageProps {
  params: Promise<{ publicId: string }>;
}

export default async function PedidoPage({ params }: PedidoPageProps) {
  const { publicId } = await params;

  return (
    <PublicLayout>
      <div className="mx-auto max-w-lg px-4 py-10">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-ink">Status do pedido</h1>
          <p className="mt-2 font-mono text-sm text-slate-500">{publicId}</p>
        </div>

        <OrderStatus publicId={publicId} />
      </div>
    </PublicLayout>
  );
}

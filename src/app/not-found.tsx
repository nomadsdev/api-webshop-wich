import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { ArrowUpRightIcon, Bug } from "lucide-react"
import Link from "next/link"

export default function notfound() {
  return (
    <main className='min-h-screen flex justify-center items-center'>
      <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <p className="gg">404</p>
        </EmptyMedia>
        <EmptyTitle>ขออภัย เราไม่พบหน้าที่คุณต้องการ</EmptyTitle>
        <EmptyDescription>
          โปรดลองดูเนื้อหาอื่นเพิ่มเติม
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent className="flex-row justify-center gap-2">
        <Button className="cursor-pointer">ดูบริการเติมเพิ่ม</Button>
        <Button className="cursor-pointer" variant="outline">ติดต่อเรา</Button>
      </EmptyContent>
      <Button
        variant="link"
        asChild
        className="text-muted-foreground"
        size="sm"
      >
        <Link href={'/faq'}>
          คำถามที่พบบ่อย <ArrowUpRightIcon />
        </Link>
      </Button>
    </Empty>
    </main>
  )
}
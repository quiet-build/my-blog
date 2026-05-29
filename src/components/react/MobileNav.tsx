import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, Button } from '@quietbuildlab/ui'

interface Props { items: ReadonlyArray<{ name: string; href: string }> }

export default function MobileNav({ items }: Props) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Open menu">☰</Button>
      </SheetTrigger>
      <SheetContent side="right">
        <SheetHeader><SheetTitle>Menu</SheetTitle></SheetHeader>
        <nav className="flex flex-col gap-4 mt-6">
          {items.map(i => <a key={i.href} href={i.href} className="text-base">{i.name}</a>)}
        </nav>
      </SheetContent>
    </Sheet>
  )
}

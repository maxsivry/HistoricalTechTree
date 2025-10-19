import TechTreeEditor from '../components/ui/tech-tree-editor'
import { supabase } from '@/lib/supabaseClient'
import type { TechNode } from '@/lib/types/tech-tree'
export const dynamic = 'force-dynamic';

export default async function Home() {
  // Fetch data on the server
  const { data: initialNodes, error } = await supabase
    .from('developments')
    .select('*')

  if (error) {
    console.error("Error fetching developments:", error)
    // You could return an error page here
  }

  // The fetched data might not have the `expanded` property. Let's add it.
  const processedNodes = (initialNodes || []).map(node => ({
    ...node,
    expanded: false, // Default to not expanded
  })) as TechNode[]

  return (
    <main className="min-h-screen bg-slate-100 dark:bg-slate-900">
      
      <TechTreeEditor initialTechNodes={processedNodes} />
    </main>
  )
}

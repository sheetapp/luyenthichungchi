
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

async function checkData() {
    console.log('Checking library_posts data...')
    const { data, error } = await supabase
        .from('library_posts')
        .select('*')

    if (error) {
        console.error('Error:', error)
    } else {
        console.log('Data count:', data.length)
        console.log('Data samples:', data.slice(0, 3))

        // Check categories
        const categories = [...new Set(data.map((p: any) => p.category))]
        console.log('Categories found:', categories)
    }
}

checkData()

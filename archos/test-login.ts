import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'

const envFile = fs.readFileSync('.env.local', 'utf8')
envFile.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/)
  if (match) process.env[match[1]] = match[2].replace(/["']/g, '').trim()
})

async function run() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  console.log("Signing in as admin@archos.demo...");
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email: 'admin@archos.demo',
    password: 'admin@123',
  })
  
  if (signInError) {
    console.log("Sign in failed:", signInError.message)
    return
  }
  
  console.log("Signed in! Session:", signInData.session?.user.email, signInData.session?.user.id)
}

run().catch(console.error)

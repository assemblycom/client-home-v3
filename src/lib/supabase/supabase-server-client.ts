import 'server-only'

import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import env from '@/config/env'

declare global {
  var _supabaseServerClient: SupabaseClient | undefined
}

export default class SupabaseServerClient {
  client: SupabaseClient

  constructor() {
    globalThis._supabaseServerClient ??= createClient(env.SUPABASE_URL, env.SUPABASE_SECRET_KEY)
    this.client = globalThis._supabaseServerClient
  }

  async getSignedUrls(paths: string[]) {
    const { data, error } = await this.client.storage
      .from(env.SUPABASE_BUCKET_NAME)
      .createSignedUrls(paths, env.SUPABASE_SIGNED_URL_EXPIRY)
    if (error) throw error

    return data
  }

  async getSignedUploadUrl(path: string) {
    const { data, error } = await this.client.storage.from(env.SUPABASE_BUCKET_NAME).createSignedUploadUrl(path)
    if (error) throw error

    return data
  }

  // async uploadToSignedUrl(path: string, token: string, file: File, fileOptions: any) {
  //   const { data, error } = await this.client.storage
  //     .from(env.SUPABASE_BUCKET_NAME)
  //     .uploadToSignedUrl(path, token, file, fileOptions)
  //   if (error) throw error

  //   return data
  // }
}

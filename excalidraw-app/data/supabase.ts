import { createClient } from "@supabase/supabase-js";

import type { AppState, BinaryFiles } from "@excalidraw/excalidraw/types";
import type { ExcalidrawElement } from "@excalidraw/element/types";

// Supabase configuration - values to be filled
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://ozbrkzwmgsixnavcqhmk.supabase.co";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96YnJrendtZ3NpeG5hdmNxaG1rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE4OTcyOTksImV4cCI6MjA2NzQ3MzI5OX0.PadqY7BHRBH1-qcmIfaSbHglOFUZEqeO1bqHfefrs80";

// Debug: Log the configuration
console.log('Supabase Config:', {
  url: SUPABASE_URL,
  key: SUPABASE_ANON_KEY ? 'Key loaded' : 'Key missing'
});

// Create Supabase client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Types for database schema
export interface DrawingData {
  id: string;
  user_id: string;
  title: string;
  elements: ExcalidrawElement[];
  app_state: Partial<AppState>;
  files: BinaryFiles;
  created_at: string;
  updated_at: string;
  is_public: boolean;
  version: number;
}

export interface UserProfile {
  id: string;
  email: string;
  display_name: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

// Auth functions
export const authService = {
  // Sign up with email and password
  async signUp(email: string, password: string, displayName?: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName || email.split("@")[0],
        },
      },
    });

    if (error) {
      throw error;
    }

    // Create user profile
    if (data.user) {
      await this.createUserProfile(data.user.id, {
        email,
        display_name: displayName || email.split("@")[0],
      });
    }

    return data;
  },

  // Sign in with email and password
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw error;
    }
    return data;
  },

  // Sign out
  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw error;
    }
  },

  // Get current user
  async getCurrentUser() {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (error) {
      throw error;
    }
    return user;
  },

  // Create user profile
  async createUserProfile(userId: string, profile: Partial<UserProfile>) {
    const { data, error } = await supabase.from("user_profiles").insert({
      id: userId,
      ...profile,
    });

    if (error) {
      throw error;
    }
    return data;
  },

  // Get user profile
  async getUserProfile(userId: string) {
    const { data, error } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      throw error;
    }
    return data;
  },

  // Update user profile
  async updateUserProfile(userId: string, updates: Partial<UserProfile>) {
    const { data, error } = await supabase
      .from("user_profiles")
      .update(updates)
      .eq("id", userId);

    if (error) {
      throw error;
    }
    return data;
  },

  // Listen to auth state changes
  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback);
  },
};

// Drawing data functions
export const drawingService = {
  // Save drawing to cloud
  async saveDrawing(
    title: string,
    elements: ExcalidrawElement[],
    appState: Partial<AppState>,
    files: BinaryFiles,
    isPublic: boolean = false,
    drawingId?: string,
  ) {
    const user = await authService.getCurrentUser();
    if (!user) {
      throw new Error("User not authenticated");
    }

    const drawingData = {
      title,
      elements,
      app_state: appState,
      files,
      is_public: isPublic,
      version: 1,
      updated_at: new Date().toISOString(),
    };

    if (drawingId) {
      // Update existing drawing
      const { data, error } = await supabase
        .from("drawings")
        .update(drawingData)
        .eq("id", drawingId)
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) {
        throw error;
      }
      return data;
    }
    // Create new drawing
    const { data, error } = await supabase
      .from("drawings")
      .insert({
        ...drawingData,
        user_id: user.id,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      throw error;
    }
    return data;
  },

  // Load drawing from cloud
  async loadDrawing(drawingId: string) {
    const user = await authService.getCurrentUser();

    let query = supabase.from("drawings").select("*").eq("id", drawingId);

    // If user is authenticated, allow access to their private drawings
    if (user) {
      query = query.or(`user_id.eq.${user.id},is_public.eq.true`);
    } else {
      // If not authenticated, only allow public drawings
      query = query.eq("is_public", true);
    }

    const { data, error } = await query.single();

    if (error) {
      throw error;
    }
    return data;
  },

  // Get user's drawings
  async getUserDrawings(userId?: string) {
    const user = userId ? { id: userId } : await authService.getCurrentUser();
    if (!user) {
      throw new Error("User not authenticated");
    }

    const { data, error } = await supabase
      .from("drawings")
      .select("id, title, created_at, updated_at, is_public")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false });

    if (error) {
      throw error;
    }
    return data;
  },

  // Delete drawing
  async deleteDrawing(drawingId: string) {
    const user = await authService.getCurrentUser();
    if (!user) {
      throw new Error("User not authenticated");
    }

    const { error } = await supabase
      .from("drawings")
      .delete()
      .eq("id", drawingId)
      .eq("user_id", user.id);

    if (error) {
      throw error;
    }
  },

  // Get public drawings
  async getPublicDrawings(limit: number = 20, offset: number = 0) {
    const { data, error } = await supabase
      .from("drawings")
      .select(
        `
        id, 
        title, 
        created_at, 
        updated_at,
        user_profiles!inner(display_name)
      `,
      )
      .eq("is_public", true)
      .order("updated_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw error;
    }
    return data;
  },

  // Search drawings
  async searchDrawings(query: string, isPublicOnly: boolean = false) {
    const user = await authService.getCurrentUser();

    let supabaseQuery = supabase
      .from("drawings")
      .select("id, title, created_at, updated_at, is_public")
      .ilike("title", `%${query}%`);

    if (isPublicOnly || !user) {
      supabaseQuery = supabaseQuery.eq("is_public", true);
    } else {
      supabaseQuery = supabaseQuery.or(
        `user_id.eq.${user.id},is_public.eq.true`,
      );
    }

    const { data, error } = await supabaseQuery
      .order("updated_at", { ascending: false })
      .limit(50);

    if (error) {
      throw error;
    }
    return data;
  },
};

// Real-time sync functions
export const syncService = {
  // Subscribe to drawing changes
  subscribeToDrawing(drawingId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`drawing:${drawingId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "drawings",
          filter: `id=eq.${drawingId}`,
        },
        callback,
      )
      .subscribe();
  },

  // Unsubscribe from drawing changes
  unsubscribeFromDrawing(drawingId: string) {
    const channel = supabase.channel(`drawing:${drawingId}`);
    return supabase.removeChannel(channel);
  },
};

export default supabase;

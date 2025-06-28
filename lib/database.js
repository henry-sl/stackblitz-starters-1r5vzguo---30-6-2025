// lib/database.js
// Database utility functions for Supabase operations
// Provides type-safe database operations for the Tenderly application

// Company operations
export const companyOperations = {
  // Get company profile for current user
  async getProfile(supabaseInstance, userId) {
    const { data, error } = await supabaseInstance
      .from('companies')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw error;
    }
    
    return data;
  },

  // Create or update company profile
  async upsertProfile(supabaseInstance, userId, profileData) {
    const { data, error } = await supabaseInstance
      .from('companies')
      .upsert({
        user_id: userId,
        ...profileData,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};

// Tender operations
export const tenderOperations = {
  // Get all active tenders
  async getAll(supabaseInstance) {
    const { data, error } = await supabaseInstance
      .from('tenders')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Get tender by ID
  async getById(supabaseInstance, id) {
    const { data, error } = await supabaseInstance
      .from('tenders')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Search tenders
  async search(supabaseInstance, query, filters = {}) {
    let queryBuilder = supabaseInstance
      .from('tenders')
      .select('*')
      .eq('status', 'active');

    // Add text search
    if (query) {
      queryBuilder = queryBuilder.textSearch('title,description,agency', query);
    }

    // Add category filter
    if (filters.category) {
      queryBuilder = queryBuilder.eq('category', filters.category);
    }

    // Add location filter
    if (filters.location) {
      queryBuilder = queryBuilder.eq('location', filters.location);
    }

    // Add date range filter
    if (filters.closingAfter) {
      queryBuilder = queryBuilder.gte('closing_date', filters.closingAfter);
    }

    const { data, error } = await queryBuilder
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }
};

// Proposal operations
export const proposalOperations = {
  // Get all proposals for user
  async getByUser(supabaseInstance, userId) {
    const { data, error } = await supabaseInstance
      .from('proposals')
      .select(`
        *,
        tenders (
          title,
          agency,
          closing_date
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Get proposal by ID
  async getById(supabaseInstance, id) {
    const { data, error } = await supabaseInstance
      .from('proposals')
      .select(`
        *,
        tenders (
          title,
          agency,
          closing_date,
          category
        )
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Create new proposal
  async create(supabaseInstance, userId, proposalData) {
    const { data, error } = await supabaseInstance
      .from('proposals')
      .insert({
        user_id: userId,
        ...proposalData
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Update proposal
  async update(supabaseInstance, id, updates) {
    const { data, error } = await supabaseInstance
      .from('proposals')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Save proposal version
  async saveVersion(supabaseInstance, proposalId, content, summary) {
    const { data, error } = await supabaseInstance
      .from('proposal_versions')
      .insert({
        proposal_id: proposalId,
        content,
        changes_summary: summary,
        version: 1 // This should be calculated based on existing versions
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};

// Attestation operations
export const attestationOperations = {
  // Get all attestations for user
  async getByUser(supabaseInstance, userId) {
    const { data, error } = await supabaseInstance
      .from('attestations')
      .select('*')
      .eq('user_id', userId)
      .order('submitted_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Create new attestation
  async create(supabaseInstance, userId, attestationData) {
    const { data, error } = await supabaseInstance
      .from('attestations')
      .insert({
        user_id: userId,
        ...attestationData
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};

// User profile operations
export const userProfileOperations = {
  // Get user profile
  async getProfile(supabaseInstance, userId) {
    const { data, error } = await supabaseInstance
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      throw error;
    }
    
    return data;
  },

  // Create or update user profile
  async upsertProfile(supabaseInstance, userId, profileData) {
    const { data, error } = await supabaseInstance
      .from('user_profiles')
      .upsert({
        user_id: userId,
        ...profileData,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};

// Utility functions
export const dbUtils = {
  // Check if user has completed company profile
  async hasCompanyProfile(supabaseInstance, userId) {
    const profile = await companyOperations.getProfile(supabaseInstance, userId);
    return profile && profile.name && profile.email;
  },

  // Get user's proposal count
  async getProposalCount(supabaseInstance, userId) {
    const { count, error } = await supabaseInstance
      .from('proposals')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);
    
    if (error) throw error;
    return count;
  },

  // Get user's attestation count
  async getAttestationCount(supabaseInstance, userId) {
    const { count, error } = await supabaseInstance
      .from('attestations')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);
    
    if (error) throw error;
    return count;
  }
};
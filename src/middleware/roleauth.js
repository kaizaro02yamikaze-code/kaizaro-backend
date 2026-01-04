import { supabase } from '../config/supabase.js';

/**
 * Middleware to check if user has the required role
 * @param {string} requiredRole - e.g., 'TEACHER', 'ADMIN'
 */
export const checkRole = (requiredRole) => {
    return async (req, res, next) => {
        try {
            // 1. Token nikalo (Header se ya Body se)
            const token = req.headers.authorization?.split(' ')[1] || req.body.token;

            if (!token) {
                return res.status(401).json({ success: false, error: "Unauthorized: No token provided" });
            }

            // 2. Supabase se User Verify karo
            const { data: { user }, error } = await supabase.auth.getUser(token);

            if (error || !user) {
                return res.status(401).json({ success: false, error: "Invalid Session" });
            }

            // 3. Database mein Role check karo
            const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single();

            if (!profile) {
                return res.status(403).json({ success: false, error: "Profile not found" });
            }

            // 4. Role Match karo (Admin ke paas sab access hota hai)
            if (profile.role !== requiredRole && profile.role !== 'ADMIN') {
                return res.status(403).json({ 
                    success: false, 
                    error: `Access Denied. Required role: ${requiredRole}` 
                });
            }

            // User sahi hai, aage badho
            req.user = user;
            next();

        } catch (err) {
            console.error("Auth Middleware Error:", err);
            res.status(500).json({ success: false, error: "Authentication Error" });
        }
    };
};
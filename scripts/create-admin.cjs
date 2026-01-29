const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

let envVars = {};
try {
    const envPath = path.resolve(__dirname, '../.env.local');
    if (fs.existsSync(envPath)) {
        const envFile = fs.readFileSync(envPath, 'utf8');
        envFile.split('\n').forEach(line => {
            const parts = line.split('=');
            if (parts.length >= 2) envVars[parts[0].trim()] = parts.slice(1).join('=').trim();
        });
    }
} catch (e) { }

const supabaseUrl = process.env.VITE_SUPABASE_URL || envVars.VITE_SUPABASE_URL || envVars.VITE_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || envVars.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
    console.error('Error: Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false }
});

async function main() {
    const email = process.argv[2];
    const password = process.argv[3];
    const role = process.argv[4] || 'admin';

    if (!email || !password) {
        console.log('Usage: node create-admin.cjs <email> <password> [role]');
        process.exit(1);
    }

    console.log(`Processing ${email}...`);

    // Check if user exists first
    const { data: users, error: listError } = await supabase.auth.admin.listUsers();
    const existingUser = users.users.find(u => u.email === email);

    let userId;

    if (existingUser) {
        userId = existingUser.id;
        console.log(`User already exists with ID: ${userId}`);
    } else {
        console.log(`Creating new user...`);
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
            email,
            password,
            email_confirm: true
        });

        if (authError) {
            console.error('Auth Error:', authError.message);
            return;
        }
        userId = authData.user.id;
        console.log(`User created with ID: ${userId}`);
    }

    console.log(`Promoting to ${role}...`);
    const { error: dbError } = await supabase
        .from('admins')
        .upsert({ user_id: userId, role }, { onConflict: 'user_id' });

    if (dbError) {
        console.error('Database Error:', dbError.message);
    } else {
        console.log(`\n🎉 Success! User ${email} is now a ${role}.`);
    }
}

main();

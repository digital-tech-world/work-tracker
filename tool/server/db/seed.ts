import { db } from './connection';
import { areas } from './schema';
import { eq } from 'drizzle-orm';

async function seedDatabase() {
  console.log('Seeding database with default areas...');
  
  // Default areas from README
  const defaultAreas = [
    { name: 'Development', description: 'Software development and coding tasks', color: '#3B82F6' },
    { name: 'Design', description: 'UI/UX design and creative work', color: '#EC4899' },
    { name: 'Planning', description: 'Project planning and strategy', color: '#10B981' },
    { name: 'Research', description: 'Learning and investigation', color: '#F59E0B' },
    { name: 'Writing', description: 'Documentation and content creation', color: '#8B5CF6' },
    { name: 'Meetings', description: 'Calls, meetings, and collaborations', color: '#EF4444' },
    { name: 'Admin', description: 'Administrative and organizational tasks', color: '#6B7280' }
  ];

  for (const areaData of defaultAreas) {
    // Check if area already exists
    const existingArea = await db.select().from(areas).where(eq(areas.name, areaData.name)).limit(1);
    
    if (existingArea.length === 0) {
      await db.insert(areas).values(areaData);
      console.log(`Created area: ${areaData.name}`);
    } else {
      console.log(`Area already exists: ${areaData.name}`);
    }
  }
  
  console.log('Database seeding completed!');
}

// Execute seed function
seedDatabase().catch((err) => {
  console.error('Error seeding database:', err);
  process.exit(1);
});

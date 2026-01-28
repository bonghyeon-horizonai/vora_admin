import { db } from './src/lib/db';
import { tools, toolI18N } from './src/lib/db/schema';
import { eq } from 'drizzle-orm';

async function checkData() {
    const t = await db.query.tools.findFirst({
        where: eq(tools.toolCode, 'vora_tool_search_main'),
        with: {
            // If relations are defined
        }
    });

    console.log('Tool:', t);

    if (t) {
        const i18n = await db.select().from(toolI18N).where(eq(toolI18N.toolId, t.id));
        console.log('I18n Entries:', i18n);
    }
}

checkData();

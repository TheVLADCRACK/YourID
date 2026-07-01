import { Injectable, InternalServerErrorException, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { DatabaseService } from '../../database/database.service';
import { mapAIContent } from '../../database/mappers';

const sanitizeInput = (s: string, maxLen = 200): string => String(s).replace(/[<>{}\[\]\\`]/g, '').substring(0, maxLen).trim();

@Injectable()
export class AiService {
  private openai: OpenAI;

  constructor(private config: ConfigService, private db: DatabaseService) {
    this.openai = new OpenAI({ apiKey: this.config.get('OPENAI_API_KEY') });
  }

  async generateProductDescription(userId: string, dto: { title: string; category: string; keywords: string[] }) {
    const title = sanitizeInput(dto.title, 100);
    const category = sanitizeInput(dto.category, 50);
    const keywords = (dto.keywords || []).slice(0, 10).map((k) => sanitizeInput(k, 30)).join(', ');

    const prompt = `Tu es un expert en copywriting et vente de produits digitaux en Afrique francophone.

Génère une description de vente convaincante pour ce produit digital:
- Titre: ${title}
- Catégorie: ${category}
- Mots-clés: ${keywords}

La description doit faire entre 150 et 250 mots, en français, orientée bénéfices client.
Réponds UNIQUEMENT avec la description.`;

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini', messages: [{ role: 'user', content: prompt }], max_tokens: 500, temperature: 0.8,
      });
      const result = response.choices[0]?.message?.content || '';
      const tokens = response.usage?.total_tokens || 0;

      this.db.run(
        `INSERT INTO ai_contents (id, userId, type, prompt, result, model, tokens, createdAt) VALUES (?, ?, 'product_description', ?, ?, 'gpt-4o-mini', ?, ?)`,
        [this.db.id(), userId, prompt, result, tokens, this.db.now()],
      );
      return { description: result, tokens };
    } catch (error: any) {
      if (error?.status === 429) throw new ServiceUnavailableException('Quota OpenAI dépassé, réessayez dans quelques minutes');
      if (error?.status === 401) throw new InternalServerErrorException('Configuration IA invalide');
      throw new ServiceUnavailableException('Erreur de génération IA: ' + (error?.message || 'Erreur inconnue'));
    }
  }

  async generateSalesPage(userId: string, dto: { title: string; audience: string; promise: string }) {
    const title = sanitizeInput(dto.title, 100);
    const audience = sanitizeInput(dto.audience, 150);
    const promise = sanitizeInput(dto.promise, 150);

    const prompt = `Tu es un expert en copywriting et création de pages de vente.

Crée une page de vente en JSON pour ce produit:
- Titre: ${title}
- Audience: ${audience}
- Promesse: ${promise}

Retourne UNIQUEMENT un JSON valide avec: hero, benefits (array), faq (array), cta_section`;

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini', messages: [{ role: 'user', content: prompt }], max_tokens: 1000, temperature: 0.7,
        response_format: { type: 'json_object' },
      });
      const result = response.choices[0]?.message?.content || '{}';
      let page: any;
      try { page = JSON.parse(result); } catch { page = { error: 'Format de réponse invalide', raw: result }; }

      this.db.run(
        `INSERT INTO ai_contents (id, userId, type, prompt, result, model, tokens, createdAt) VALUES (?, ?, 'sales_page', ?, ?, 'gpt-4o-mini', ?, ?)`,
        [this.db.id(), userId, prompt, result, response.usage?.total_tokens || 0, this.db.now()],
      );
      return { page };
    } catch (error: any) {
      if (error?.status === 429) throw new ServiceUnavailableException('Quota OpenAI dépassé');
      if (error?.status === 401) throw new InternalServerErrorException('Configuration IA invalide');
      throw new ServiceUnavailableException('Erreur de génération IA');
    }
  }

  async getHistory(userId: string) {
    const rows = this.db.all('SELECT * FROM ai_contents WHERE userId = ? ORDER BY createdAt DESC LIMIT 20', [userId]);
    return rows.map(mapAIContent);
  }
}

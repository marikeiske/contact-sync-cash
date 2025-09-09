import { Contact } from '@/types/contact';

const STORAGE_KEY = 'contacts_db';

export class StorageService {
  // Simula uma conexão SQLite com localStorage
  static initializeDB(): void {
    if (!localStorage.getItem(STORAGE_KEY)) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
    }
  }

  static getAllContacts(): Contact[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Erro ao buscar contatos:', error);
      return [];
    }
  }

  static saveContact(contact: Omit<Contact, 'id' | 'data_criacao'>): Contact {
    try {
      const contacts = this.getAllContacts();
      const newContact: Contact = {
        ...contact,
        id: this.generateId(),
        data_criacao: new Date().toISOString(),
        data_atualizacao: new Date().toISOString()
      };

      contacts.push(newContact);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(contacts));
      return newContact;
    } catch (error) {
      console.error('Erro ao salvar contato:', error);
      throw new Error('Falha ao salvar contato');
    }
  }

  static updateContact(id: string, updates: Partial<Contact>): Contact {
    try {
      const contacts = this.getAllContacts();
      const index = contacts.findIndex(c => c.id === id);
      
      if (index === -1) {
        throw new Error('Contato não encontrado');
      }

      contacts[index] = {
        ...contacts[index],
        ...updates,
        data_atualizacao: new Date().toISOString()
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(contacts));
      return contacts[index];
    } catch (error) {
      console.error('Erro ao atualizar contato:', error);
      throw new Error('Falha ao atualizar contato');
    }
  }

  static deleteContact(id: string): boolean {
    try {
      const contacts = this.getAllContacts();
      const filteredContacts = contacts.filter(c => c.id !== id);
      
      if (contacts.length === filteredContacts.length) {
        throw new Error('Contato não encontrado');
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredContacts));
      return true;
    } catch (error) {
      console.error('Erro ao deletar contato:', error);
      throw new Error('Falha ao deletar contato');
    }
  }

  static searchContacts(query: string): Contact[] {
    try {
      const contacts = this.getAllContacts();
      const lowerQuery = query.toLowerCase();
      
      return contacts.filter(contact => 
        contact.nome.toLowerCase().includes(lowerQuery) ||
        contact.email.toLowerCase().includes(lowerQuery) ||
        contact.telefone.includes(query)
      );
    } catch (error) {
      console.error('Erro ao buscar contatos:', error);
      return [];
    }
  }

  private static generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Simula prepared statements - seria implementado no SQLite real
  static executePreparedStatement(sql: string, params: any[]): any {
    console.log('Executing SQL:', sql, 'with params:', params);
    // Esta seria a implementação real com SQLite
    // return db.prepare(sql).all(...params);
  }

  // Simula transações - seria implementado no SQLite real  
  static executeTransaction(operations: (() => void)[]): void {
    try {
      // BEGIN TRANSACTION
      operations.forEach(op => op());
      // COMMIT
    } catch (error) {
      // ROLLBACK
      throw error;
    }
  }
}
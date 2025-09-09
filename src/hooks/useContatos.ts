import { useState, useEffect, useRef, useCallback } from 'react';
import { Contact, ContactFormData } from '@/types/contact';
import { StorageService } from '@/services/storageService';
import { CurrencyService } from '@/services/currencyService';
import { toast } from '@/hooks/use-toast';

interface UseContatosReturn {
  contacts: Contact[];
  loading: boolean;
  error: string | null;
  searchQuery: string;
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  // Actions
  addContact: (data: ContactFormData) => Promise<Contact | null>;
  updateContact: (id: string, data: Partial<ContactFormData>) => Promise<Contact | null>;
  deleteContact: (id: string) => Promise<boolean>;
  setSearchQuery: (query: string) => void;
  setCurrentPage: (page: number) => void;
  refreshContacts: () => void;
  // Pagination helpers
  paginatedContacts: Contact[];
  goToNextPage: () => void;
  goToPreviousPage: () => void;
}

export const useContatos = (itemsPerPage: number = 10): UseContatosReturn => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Cache usando useRef para otimização
  const contactsCache = useRef<Map<string, Contact>>(new Map());
  const lastFetchTime = useRef<Date | null>(null);

  // Inicializa o banco de dados
  useEffect(() => {
    StorageService.initializeDB();
    loadContacts();
  }, []);

  const loadContacts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const allContacts = StorageService.getAllContacts();
      setContacts(allContacts);
      
      // Atualiza cache
      contactsCache.current.clear();
      allContacts.forEach(contact => {
        contactsCache.current.set(contact.id, contact);
      });
      
      lastFetchTime.current = new Date();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar contatos';
      setError(errorMessage);
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const addContact = useCallback(async (data: ContactFormData): Promise<Contact | null> => {
    try {
      setLoading(true);
      
      // Converte salário para outras moedas
      const { usd, eur } = await CurrencyService.convertCurrency(data.salario_brl);
      
      // Processa foto se existir (simula BLOB storage)
      let fotoBase64: string | undefined;
      if (data.foto) {
        fotoBase64 = await fileToBase64(data.foto);
      }

      const contactData = {
        nome: data.nome,
        telefone: data.telefone,
        email: data.email,
        foto: fotoBase64,
        salario_brl: data.salario_brl,
        salario_usd: usd,
        salario_eur: eur
      };

      const newContact = StorageService.saveContact(contactData);
      
      // Atualiza estado e cache
      setContacts(prev => [newContact, ...prev]);
      contactsCache.current.set(newContact.id, newContact);
      
      toast({
        title: "Sucesso",
        description: "Contato adicionado com sucesso!"
      });
      
      return newContact;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao adicionar contato';
      setError(errorMessage);
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive"
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateContact = useCallback(async (id: string, data: Partial<ContactFormData>): Promise<Contact | null> => {
    try {
      setLoading(true);
      
      let updateData: any = { ...data };
      
      // Recalcula moedas se salário mudou
      if (data.salario_brl) {
        const { usd, eur } = await CurrencyService.convertCurrency(data.salario_brl);
        updateData.salario_usd = usd;
        updateData.salario_eur = eur;
      }
      
      // Processa nova foto se existir
      if (data.foto) {
        updateData.foto = await fileToBase64(data.foto);
      }

      const updatedContact = StorageService.updateContact(id, updateData);
      
      // Atualiza estado e cache
      setContacts(prev => prev.map(c => c.id === id ? updatedContact : c));
      contactsCache.current.set(id, updatedContact);
      
      toast({
        title: "Sucesso",
        description: "Contato atualizado com sucesso!"
      });
      
      return updatedContact;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar contato';
      setError(errorMessage);
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive"
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteContact = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      
      const success = StorageService.deleteContact(id);
      
      if (success) {
        // Atualiza estado e cache
        setContacts(prev => prev.filter(c => c.id !== id));
        contactsCache.current.delete(id);
        
        toast({
          title: "Sucesso",
          description: "Contato removido com sucesso!"
        });
      }
      
      return success;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao remover contato';
      setError(errorMessage);
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Filtra contatos baseado na pesquisa
  const filteredContacts = searchQuery 
    ? StorageService.searchContacts(searchQuery)
    : contacts;

  // Calcula paginação
  const totalPages = Math.ceil(filteredContacts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedContacts = filteredContacts.slice(startIndex, startIndex + itemsPerPage);

  const goToNextPage = useCallback(() => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  }, [currentPage, totalPages]);

  const goToPreviousPage = useCallback(() => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  }, [currentPage]);

  const refreshContacts = useCallback(() => {
    loadContacts();
  }, [loadContacts]);

  // Reset página quando pesquisa muda
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  return {
    contacts: filteredContacts,
    loading,
    error,
    searchQuery,
    currentPage,
    totalPages,
    itemsPerPage,
    addContact,
    updateContact,
    deleteContact,
    setSearchQuery,
    setCurrentPage,
    refreshContacts,
    paginatedContacts,
    goToNextPage,
    goToPreviousPage
  };
};

// Utility function
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};
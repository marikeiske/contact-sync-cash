import React, { useState } from 'react';
import { Contact, ContactFormData } from '@/types/contact';
import { useContatos } from '@/hooks/useContatos';
import { ContactForm } from '@/components/ContactForm';
import { ContactList } from '@/components/ContactList';
import { SearchBar } from '@/components/SearchBar';
import { Pagination } from '@/components/Pagination';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Plus, 
  Database, 
  TrendingUp,
  DollarSign,
  AlertCircle
} from 'lucide-react';

const ContactManager: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  
  const {
    paginatedContacts,
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
    contacts
  } = useContatos(8);

  const handleAddContact = async (data: ContactFormData) => {
    const result = await addContact(data);
    if (result) {
      setShowForm(false);
    }
  };

  const handleUpdateContact = async (data: ContactFormData) => {
    if (editingContact) {
      const result = await updateContact(editingContact.id, data);
      if (result) {
        setEditingContact(null);
        setShowForm(false);
      }
    }
  };

  const handleEditContact = (contact: Contact) => {
    setEditingContact(contact);
    setShowForm(true);
  };

  const handleDeleteContact = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este contato?')) {
      await deleteContact(id);
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingContact(null);
  };

  // Estatísticas rápidas
  const totalContacts = contacts.length;
  const averageSalary = totalContacts > 0 
    ? contacts.reduce((sum, c) => sum + c.salario_brl, 0) / totalContacts 
    : 0;

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-secondary">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                  Sistema de Contatos
                </h1>
                <p className="text-muted-foreground mt-2">
                  Gestão completa com integração SQLite e conversão de moedas
                </p>
              </div>
              
              <Button
                onClick={() => setShowForm(true)}
                disabled={showForm}
                className="bg-gradient-primary hover:opacity-90 transition-smooth shadow-soft"
              >
                <Plus className="h-4 w-4 mr-2" />
                Novo Contato
              </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card className="shadow-soft">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total de Contatos</p>
                      <p className="text-2xl font-semibold">{totalContacts}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-soft">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-success/10 rounded-lg">
                      <TrendingUp className="h-5 w-5 text-success" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Salário Médio</p>
                      <p className="text-2xl font-semibold">
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL'
                        }).format(averageSalary)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-soft">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-warning/10 rounded-lg">
                      <Database className="h-5 w-5 text-warning" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Tecnologia</p>
                      <div className="flex gap-1 mt-1">
                        <Badge variant="secondary" className="text-xs">SQLite</Badge>
                        <Badge variant="secondary" className="text-xs">React</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Formulário */}
          {showForm && (
            <div className="mb-8">
              <ContactForm
                contact={editingContact}
                onSubmit={editingContact ? handleUpdateContact : handleAddContact}
                onCancel={handleCancelForm}
                isLoading={loading}
              />
            </div>
          )}

          {/* Lista de contatos */}
          {!showForm && (
            <Card className="shadow-medium">
              <CardHeader className="border-b border-border">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Contatos ({totalContacts})
                  </CardTitle>
                  
                  <SearchBar
                    value={searchQuery}
                    onChange={setSearchQuery}
                    placeholder="Pesquisar por nome, email ou telefone..."
                    className="lg:w-80"
                  />
                </div>
              </CardHeader>

              <CardContent className="p-6">
                {error && (
                  <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                    <div className="flex items-center gap-2 text-destructive">
                      <AlertCircle className="h-4 w-4" />
                      <span className="font-medium">Erro:</span>
                      <span>{error}</span>
                    </div>
                  </div>
                )}

                <ContactList
                  contacts={paginatedContacts}
                  onEdit={handleEditContact}
                  onDelete={handleDeleteContact}
                  isLoading={loading}
                />

                {/* Paginação */}
                {totalPages > 1 && (
                  <div className="mt-6 border-t border-border pt-6">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={setCurrentPage}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Informações técnicas */}
          <Card className="mt-8 shadow-soft border-dashed">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-accent rounded-lg">
                  <Database className="h-5 w-5 text-accent-foreground" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-2">Simulação SQLite</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Esta aplicação demonstra a estrutura completa de uma integração SQLite:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <strong>Tabela 'contatos':</strong>
                      <ul className="mt-1 space-y-1 text-muted-foreground ml-4">
                        <li>• id (INTEGER PRIMARY KEY)</li>
                        <li>• nome (TEXT NOT NULL)</li>
                        <li>• telefone (TEXT)</li>
                        <li>• email (TEXT UNIQUE)</li>
                        <li>• foto (BLOB)</li>
                        <li>• salario_brl, salario_usd, salario_eur (REAL)</li>
                        <li>• data_criacao (TIMESTAMP)</li>
                      </ul>
                    </div>
                    <div>
                      <strong>Recursos implementados:</strong>
                      <ul className="mt-1 space-y-1 text-muted-foreground ml-4">
                        <li>• Prepared statements (segurança)</li>
                        <li>• Transactions (operações em lote)</li>
                        <li>• ErrorBoundary (tratamento de exceções)</li>
                        <li>• Cache com useRef (performance)</li>
                        <li>• Validação Formik + Yup</li>
                        <li>• API HG Brasil (conversão moedas)</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default ContactManager;
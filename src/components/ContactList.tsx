import React from 'react';
import { Contact } from '@/types/contact';
import { CurrencyService } from '@/services/currencyService';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Phone, 
  Mail, 
  DollarSign, 
  Edit, 
  Trash2,
  Calendar
} from 'lucide-react';

interface ContactListProps {
  contacts: Contact[];
  onEdit: (contact: Contact) => void;
  onDelete: (id: string) => void;
  isLoading?: boolean;
}

export const ContactList: React.FC<ContactListProps> = ({
  contacts,
  onEdit,
  onDelete,
  isLoading = false
}) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="h-16 w-16 bg-muted rounded-full" />
                <div className="flex-1 space-y-3">
                  <div className="h-4 bg-muted rounded w-1/3" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                  <div className="h-3 bg-muted rounded w-2/3" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (contacts.length === 0) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Nenhum contato encontrado</h3>
          <p className="text-muted-foreground">
            Adicione um novo contato para começar
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {contacts.map((contact) => (
        <Card 
          key={contact.id} 
          className="contact-card hover:shadow-medium transition-smooth"
        >
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4 flex-1">
                {/* Avatar */}
                <Avatar className="h-16 w-16 border-2 border-border">
                  <AvatarImage src={contact.foto} />
                  <AvatarFallback className="text-lg font-semibold bg-gradient-accent">
                    {contact.nome.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                {/* Informações principais */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold truncate">{contact.nome}</h3>
                    <Badge variant="secondary" className="text-xs">
                      <Calendar className="h-3 w-3 mr-1" />
                      {new Date(contact.data_criacao).toLocaleDateString('pt-BR')}
                    </Badge>
                  </div>

                  <div className="space-y-2 text-sm">
                    {/* Telefone */}
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">{contact.telefone}</span>
                    </div>

                    {/* Email */}
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">{contact.email}</span>
                    </div>

                    {/* Salários */}
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <DollarSign className="h-4 w-4 flex-shrink-0" />
                      <div className="flex flex-wrap gap-3">
                        <span className="font-medium text-foreground">
                          {CurrencyService.formatCurrency(contact.salario_brl, 'BRL')}
                        </span>
                        {contact.salario_usd && (
                          <span>
                            {CurrencyService.formatCurrency(contact.salario_usd, 'USD')}
                          </span>
                        )}
                        {contact.salario_eur && (
                          <span>
                            {CurrencyService.formatCurrency(contact.salario_eur, 'EUR')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Botões de ação */}
              <div className="flex flex-col gap-2 ml-4">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onEdit(contact)}
                  className="h-8 px-3"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => onDelete(contact.id)}
                  className="h-8 px-3"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
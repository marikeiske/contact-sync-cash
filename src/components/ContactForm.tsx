import React, { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { ContactFormData, Contact } from '@/types/contact';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Upload, X, User } from 'lucide-react';

interface ContactFormProps {
  contact?: Contact | null;
  onSubmit: (data: ContactFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const validationSchema = Yup.object({
  nome: Yup.string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres')
    .required('Nome é obrigatório'),
  telefone: Yup.string()
    .matches(/^[\d\s\(\)\-\+]+$/, 'Telefone deve conter apenas números e símbolos')
    .min(8, 'Telefone deve ter pelo menos 8 dígitos')
    .required('Telefone é obrigatório'),
  email: Yup.string()
    .email('Email deve ser válido')
    .required('Email é obrigatório'),
  salario_brl: Yup.number()
    .positive('Salário deve ser um valor positivo')
    .required('Salário é obrigatório')
});

export const ContactForm: React.FC<ContactFormProps> = ({
  contact,
  onSubmit,
  onCancel,
  isLoading = false
}) => {
  const [photoPreview, setPhotoPreview] = useState<string>(contact?.foto || '');

  const initialValues: ContactFormData = {
    nome: contact?.nome || '',
    telefone: contact?.telefone || '',
    email: contact?.email || '',
    salario_brl: contact?.salario_brl || 0,
    foto: null
  };

  const handlePhotoChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    setFieldValue: (field: string, value: any) => void
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      setFieldValue('foto', file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = (setFieldValue: (field: string, value: any) => void) => {
    setFieldValue('foto', null);
    setPhotoPreview('');
  };

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-medium">
      <CardHeader className="bg-gradient-primary text-primary-foreground">
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          {contact ? 'Editar Contato' : 'Novo Contato'}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={async (values) => {
            await onSubmit(values);
          }}
        >
          {({ setFieldValue, isSubmitting }) => (
            <Form className="space-y-6">
              {/* Foto */}
              <div className="flex flex-col items-center space-y-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={photoPreview} />
                  <AvatarFallback className="text-2xl">
                    <User className="h-8 w-8" />
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex gap-2">
                  <Label htmlFor="photo-upload" className="cursor-pointer">
                    <Button type="button" variant="outline" size="sm" asChild>
                      <span className="flex items-center gap-2">
                        <Upload className="h-4 w-4" />
                        Foto
                      </span>
                    </Button>
                  </Label>
                  <input
                    id="photo-upload"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handlePhotoChange(e, setFieldValue)}
                    className="hidden"
                  />
                  {photoPreview && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removePhoto(setFieldValue)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Nome */}
              <div className="space-y-2">
                <Label htmlFor="nome">Nome *</Label>
                <Field
                  as={Input}
                  id="nome"
                  name="nome"
                  placeholder="Digite o nome completo"
                  className="transition-smooth focus:shadow-soft"
                />
                <ErrorMessage name="nome" component="div" className="text-sm text-destructive" />
              </div>

              {/* Telefone */}
              <div className="space-y-2">
                <Label htmlFor="telefone">Telefone *</Label>
                <Field
                  as={Input}
                  id="telefone"
                  name="telefone"
                  placeholder="(11) 99999-9999"
                  className="transition-smooth focus:shadow-soft"
                />
                <ErrorMessage name="telefone" component="div" className="text-sm text-destructive" />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Field
                  as={Input}
                  id="email"
                  name="email"
                  type="email"
                  placeholder="exemplo@email.com"
                  className="transition-smooth focus:shadow-soft"
                />
                <ErrorMessage name="email" component="div" className="text-sm text-destructive" />
              </div>

              {/* Salário */}
              <div className="space-y-2">
                <Label htmlFor="salario_brl">Salário (BRL) *</Label>
                <Field
                  as={Input}
                  id="salario_brl"
                  name="salario_brl"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0,00"
                  className="transition-smooth focus:shadow-soft"
                />
                <ErrorMessage name="salario_brl" component="div" className="text-sm text-destructive" />
                <p className="text-sm text-muted-foreground">
                  Os valores em USD e EUR serão calculados automaticamente
                </p>
              </div>

              {/* Botões */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={isSubmitting || isLoading}
                  className="flex-1 bg-gradient-primary hover:opacity-90 transition-smooth"
                >
                  {isSubmitting || isLoading ? 'Salvando...' : contact ? 'Atualizar' : 'Salvar'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  disabled={isSubmitting || isLoading}
                  className="flex-1"
                >
                  Cancelar
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </CardContent>
    </Card>
  );
};
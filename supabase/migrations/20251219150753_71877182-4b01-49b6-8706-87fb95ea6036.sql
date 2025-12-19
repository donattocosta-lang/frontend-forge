-- Policies para user_roles
CREATE POLICY "Users can view their own role"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

-- Admins podem ver todos os roles
CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Admins podem inserir roles
CREATE POLICY "Admins can insert roles"
ON public.user_roles
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Admins podem atualizar roles
CREATE POLICY "Admins can update roles"
ON public.user_roles
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- Admins podem ver todos os usuarios
CREATE POLICY "Admins can view all users"
ON public.usuarios
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Policy para inserir usuário (durante registro)
CREATE POLICY "Users can insert their own profile"
ON public.usuarios
FOR INSERT
WITH CHECK (auth.uid() = id);
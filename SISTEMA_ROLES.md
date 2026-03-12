# Sistema de Gestión de Bitácora y Asistencia

## 🔐 Sistema de Autenticación y Roles

### 3 Roles Implementados:

#### 👑 SUPER ADMIN
**Credenciales:**
- Usuario: `1007260358`
- Contraseña: `romanos812`

**Acceso:**
- Panel exclusivo en `/superadmin`
- Botón "Super Admin" en el header

**Funcionalidades:**
- ✅ Crear Administradores
  - Formulario para crear nuevos admins
  - Campos: Nombre, Cédula, Contraseña
  - Los admins creados se guardan en Firebase
- ✅ Ver lista de administradores
  - Tabla con todos los admins registrados
  - Muestra: Nombre, Cédula, Fecha de creación
- ✅ Acceso completo a la plataforma
  - Todas las pestañas: Nuevo Registro, Ver Registros, Estadísticas, Asistencia
  - Puede crear, editar, eliminar y marcar registros como completados
  - Puede registrar asistencias

---

#### 👨‍💼 ADMIN
**Credenciales:**
- Creadas por el Super Admin
- Cédula y contraseña personalizadas

**Acceso:**
- Panel exclusivo en `/admin`
- Botón "Administrar" en el header

**Funcionalidades:**

**Panel de Administración (/admin):**
- ✅ Gestionar Responsables
  - Crear nuevos responsables
  - Ver lista de responsables
  - Eliminar responsables
  - Los responsables aparecen en el formulario de bitácora
- ✅ Gestionar Categorías
  - Crear nuevas categorías (solo nombre, el valor se genera automáticamente)
  - Ver lista de categorías
  - Eliminar categorías
  - Las categorías aparecen en el formulario de bitácora

**Página Principal:**
- ✅ Acceso completo a todas las pestañas:
  - Nuevo Registro: Crear registros en la bitácora
  - Ver Registros: Ver, editar, eliminar y cambiar estado de registros
  - Estadísticas: Ver gráficos y estadísticas
  - Asistencia: Registrar entradas/salidas con validación GPS
- ✅ Acciones en registros:
  - Editar registros
  - Marcar como completada/pendiente
  - Eliminar registros

**Restricciones:**
- ❌ NO puede acceder al panel de Super Admin
- ❌ NO puede crear otros administradores

---

#### 👤 GUEST (Usuario sin login)
**Acceso:**
- Puede entrar directamente al link sin iniciar sesión
- Botón "Iniciar Sesión" en el header

**Funcionalidades:**
- ✅ Ver Registros (Solo lectura)
  - Solo tiene acceso a la pestaña "Ver Registros"
  - Puede ver todos los registros de la bitácora
  - Puede usar filtros (responsable, estado, vencidas)
- ✅ Vista Móvil Optimizada
  - Diseño compacto tipo tarjeta
  - Muestra: Título, fecha, responsable, categoría, estado
  - Click en cualquier fila abre un diálogo con todos los detalles:
    - Título completo
    - Descripción completa
    - Fechas (evento y entrega)
    - Responsable
    - Categoría
    - Estado
    - Fecha de creación

**Restricciones:**
- ❌ NO puede crear registros
- ❌ NO puede editar registros
- ❌ NO puede eliminar registros
- ❌ NO puede cambiar estados
- ❌ NO tiene acceso a: Nuevo Registro, Estadísticas, Asistencia
- ❌ NO tiene botón de acciones (⋮)

---

## 📱 Mejoras de UI Móvil

### Vista Desktop:
- Tabla completa con todas las columnas
- Menú de acciones (⋮) para admin/superadmin

### Vista Mobile:
- Diseño compacto tipo tarjeta
- Solo información esencial visible
- Colores de fondo según estado:
  - 🟢 Verde = Completada
  - 🟡 Amarillo = Pendiente
  - 🔴 Rojo = Vencida
- Interacción según rol:
  - Guest: Click en fila → Ver detalles completos
  - Admin/SuperAdmin: Botón (⋮) → Editar/Completar/Eliminar

---

## 🗂️ Estructura de Datos Dinámica

### Responsables:
- Creados por el Admin en `/admin`
- Se guardan en Firebase (colección `responsables`)
- Aparecen automáticamente en el formulario de bitácora

### Categorías:
- Creadas por el Admin en `/admin`
- Solo se pide el nombre (ej: "CUBRIMIENTO")
- El valor se genera automáticamente (ej: "cubrimiento")
- Se guardan en Firebase (colección `categorias`)
- Aparecen automáticamente en el formulario de bitácora

---

## 🔄 Flujo de Trabajo

1. Super Admin crea cuentas de Admin
2. Admin configura responsables y categorías
3. Admin/SuperAdmin crean y gestionan registros de bitácora
4. Admin/SuperAdmin registran asistencias con GPS
5. Guest puede consultar registros (solo lectura)

---

## 🎨 Características Adicionales

- ✅ Autenticación con localStorage
- ✅ Validación GPS para asistencias
- ✅ Filtros avanzados en registros
- ✅ Paginación en tablas
- ✅ Notificaciones toast
- ✅ Diálogos de confirmación para eliminar
- ✅ Responsive design (desktop y móvil)
- ✅ Colores según estado de tareas
- ✅ Indicadores de tareas vencidas

---

## 🚀 Cómo Empezar

1. **Iniciar sesión como Super Admin:**
   - Usuario: `1007260358`
   - Contraseña: `romanos812`

2. **Crear un Admin:**
   - Ir a `/superadmin`
   - Llenar el formulario de crear administrador
   - Guardar las credenciales

3. **Configurar el sistema (como Admin):**
   - Iniciar sesión con las credenciales del admin
   - Ir a `/admin`
   - Crear responsables en la pestaña "Responsables"
   - Crear categorías en la pestaña "Categorías"

4. **Usar el sistema:**
   - Crear registros en "Nuevo Registro"
   - Ver y gestionar registros en "Ver Registros"
   - Consultar estadísticas en "Estadísticas"
   - Registrar asistencias en "Asistencia"

---

## 📦 Colecciones de Firebase

- `admins` - Administradores creados por Super Admin
- `responsables` - Responsables creados por Admin
- `categorias` - Categorías creadas por Admin
- `bitacora_entries` - Registros de la bitácora
- `asistencia_entries` - Registros de asistencia

---

## 🔧 Tecnologías Utilizadas

- **Frontend:** Next.js 14, React 18, TypeScript
- **UI:** Radix UI, Tailwind CSS, Shadcn/ui
- **Backend:** Firebase Firestore
- **Autenticación:** Context API + localStorage
- **Formularios:** React Hook Form + Zod
- **Gráficos:** Recharts
- **Notificaciones:** Sonner
